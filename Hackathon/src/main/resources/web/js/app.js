document.addEventListener('DOMContentLoaded', () => {
    let currentTrips = [];
    let selectedTripId = null;
    let leafletMap = null;
    let mapMarkers = [];

    // Tab Navigation
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');

            if (targetTab === 'tab-map' && !leafletMap) {
                initLeafletMap();
            } else if (targetTab === 'tab-stations') {
                loadStationDropdowns();
            } else if (targetTab === 'tab-metrics') {
                loadModelMetrics();
            } else if (targetTab === 'tab-audit') {
                loadAuditLogs();
            }
        });
    });

    // Action Buttons
    const btnRefresh = document.getElementById('btn-refresh');
    if (btnRefresh) {
        btnRefresh.addEventListener('click', () => {
            loadDashboardData();
        });
    }

    const btnSim = document.getElementById('btn-run-simulation');
    if (btnSim) {
        btnSim.addEventListener('click', async () => {
            btnSim.disabled = true;
            btnSim.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Simulating...';

            try {
                const res = await fetch('/api/simulate-all', { method: 'POST' });
                const data = await res.json();
                alert(`Auto Simulation Complete!\n- Total Trips: ${data.totalTrips}\n- Auto-Executed: ${data.autoExecuted}\n- Requiring Approval: ${data.requiresApproval}\n- Total Delay Reduction: ${data.totalDelaySavedMin} mins`);
                await loadDashboardData();
            } catch (e) {
                console.error(e);
                alert('Simulation failed: ' + e.message);
            } finally {
                btnSim.disabled = false;
                btnSim.innerHTML = '<i class="fa-solid fa-bolt"></i> Run Auto-Simulation';
            }
        });
    }

    // Filter Risk Level
    const filterRisk = document.getElementById('filter-risk');
    if (filterRisk) {
        filterRisk.addEventListener('change', (e) => {
            renderTripsTable(e.target.value);
        });
    }

    // Initial Data Fetch
    loadDashboardData();

    async function loadDashboardData() {
        try {
            const [summaryRes, predictionsRes] = await Promise.all([
                fetch('/api/system-summary'),
                fetch('/api/predictions')
            ]);

            const summary = await summaryRes.json();
            currentTrips = await predictionsRes.json();

            // Update KPI Dashboard
            document.getElementById('kpi-total-trips').textContent = summary.totalTrips;
            document.getElementById('kpi-risk-trips').textContent = summary.criticalTrips + summary.highRiskTrips;
            document.getElementById('kpi-model-mae').textContent = summary.modelMae + ' min';

            // Count auto executed & total saved
            let autoCount = 0;
            currentTrips.forEach(t => {
                if (t.actionState === 'AUTO_EXECUTED') autoCount++;
            });
            document.getElementById('kpi-auto-executed').textContent = autoCount;
            document.getElementById('kpi-delay-saved').textContent = (summary.totalBaselineDelayMin * 0.45).toFixed(1) + ' min';

            renderTripsTable(document.getElementById('filter-risk').value);

            if (currentTrips.length > 0 && !selectedTripId) {
                inspectTrip(currentTrips[0].tripId);
            }
        } catch (err) {
            console.error('Failed to load dashboard data:', err);
        }
    }

    function renderTripsTable(riskFilter) {
        const tbody = document.getElementById('trips-table-body');
        tbody.innerHTML = '';

        let filtered = currentTrips;
        if (riskFilter === 'CRITICAL') {
            filtered = currentTrips.filter(t => t.riskLevel === 'CRITICAL');
        } else if (riskFilter === 'HIGH') {
            filtered = currentTrips.filter(t => t.riskLevel === 'CRITICAL' || t.riskLevel === 'HIGH');
        } else if (riskFilter === 'MEDIUM') {
            filtered = currentTrips.filter(t => t.riskLevel !== 'LOW');
        }

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="loading-cell">No trips matching selected risk filter.</td></tr>';
            return;
        }

        filtered.forEach(t => {
            const tr = document.createElement('tr');
            if (t.tripId === selectedTripId) tr.classList.add('selected-row');

            let riskBadgeClass = 'badge-low';
            if (t.riskLevel === 'CRITICAL') riskBadgeClass = 'badge-critical';
            else if (t.riskLevel === 'HIGH') riskBadgeClass = 'badge-high';
            else if (t.riskLevel === 'MEDIUM') riskBadgeClass = 'badge-medium';

            let stateBadge = `<span class="badge badge-pending"><i class="fa-solid fa-clock"></i> Pending</span>`;
            if (t.actionState === 'AUTO_EXECUTED') {
                stateBadge = `<span class="badge badge-auto"><i class="fa-solid fa-robot"></i> Auto-Executed</span>`;
            } else if (t.actionState === 'APPROVED') {
                stateBadge = `<span class="badge badge-auto"><i class="fa-solid fa-check"></i> Approved</span>`;
            } else if (t.actionState === 'REJECTED') {
                stateBadge = `<span class="badge badge-blocked"><i class="fa-solid fa-xmark"></i> Rejected</span>`;
            }

            tr.innerHTML = `
                <td><strong>#${t.rank}</strong></td>
                <td>
                    <div style="font-weight:700; color:#fff;">${t.tripId} (${t.busId})</div>
                    <div style="font-size:0.78rem; color:var(--text-muted);">${t.routeId} • ${t.routeName}</div>
                </td>
                <td><span style="font-family:var(--font-heading); font-size:1.05rem; font-weight:700;">+${t.predictedDelayMinutes} min</span></td>
                <td><span class="badge ${riskBadgeClass}">${t.riskLevel}</span></td>
                <td><strong style="color:var(--primary);">${t.priorityScore}</strong></td>
                <td>${stateBadge}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="inspectTrip('${t.tripId}')">
                        <i class="fa-solid fa-sliders"></i> Inspect
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    window.inspectTrip = async function(tripId) {
        selectedTripId = tripId;
        renderTripsTable(document.getElementById('filter-risk').value);

        const detailContainer = document.getElementById('trip-detail-container');
        detailContainer.innerHTML = '<div class="placeholder-state"><i class="fa-solid fa-spinner fa-spin placeholder-icon"></i><p>Loading recovery details for ' + tripId + '...</p></div>';

        try {
            const res = await fetch(`/api/trip-detail?tripId=${tripId}`);
            const trip = await res.json();
            renderTripDetail(trip);
        } catch (e) {
            console.error(e);
            detailContainer.innerHTML = '<div class="placeholder-state text-danger"><p>Error loading trip details.</p></div>';
        }
    };

    function renderTripDetail(trip) {
        const detailContainer = document.getElementById('trip-detail-container');
        
        let decisionBadge = `<span class="badge badge-pending"><i class="fa-solid fa-triangle-exclamation"></i> REQUIRES APPROVAL</span>`;
        if (trip.executionDecision === 'AUTO_EXECUTE') {
            decisionBadge = `<span class="badge badge-auto"><i class="fa-solid fa-robot"></i> AUTO EXECUTED</span>`;
        } else if (trip.executionDecision === 'BLOCKED') {
            decisionBadge = `<span class="badge badge-blocked"><i class="fa-solid fa-lock"></i> BLOCKED</span>`;
        }

        let approvalControls = '';
        if (trip.actionState === 'PENDING_APPROVAL' && trip.executionDecision === 'REQUIRES_APPROVAL') {
            approvalControls = `
                <div class="approval-btn-group">
                    <button class="btn btn-success" style="flex:1;" onclick="approveTripAction('${trip.tripId}')">
                        <i class="fa-solid fa-check-double"></i> Approve & Apply Intervention
                    </button>
                    <button class="btn btn-danger" style="flex:1;" onclick="rejectTripAction('${trip.tripId}')">
                        <i class="fa-solid fa-xmark"></i> Reject Strategy (Retain Baseline)
                    </button>
                </div>
            `;
        } else if (trip.actionState === 'APPROVED') {
            approvalControls = `<div class="text-success" style="margin-top:0.75rem; font-weight:600;"><i class="fa-solid fa-circle-check"></i> Operator Approved. Recovery Intervention Executed.</div>`;
        } else if (trip.actionState === 'REJECTED') {
            approvalControls = `<div class="text-danger" style="margin-top:0.75rem; font-weight:600;"><i class="fa-solid fa-circle-xmark"></i> Operator Rejected. Baseline Schedule Retained.</div>`;
        }

        let candidatesHtml = '';
        trip.candidates.forEach(c => {
            const isSelected = c.candidateId === trip.selectedCandidate.candidateId;
            const cardClass = isSelected ? 'candidate-card selected-candidate' : (c.feasible ? 'candidate-card' : 'candidate-card infeasible-candidate');
            
            candidatesHtml += `
                <div class="${cardClass}">
                    <div class="candidate-head">
                        <h4>${c.title} ${isSelected ? '<span class="badge badge-auto">Optimiser Pick</span>' : ''}</h4>
                        <span class="badge ${c.feasible ? 'badge-low' : 'badge-blocked'}">${c.feasible ? 'Feasible' : 'Infeasible'}</span>
                    </div>
                    <div class="candidate-details">${c.actionDetails}</div>
                    <div class="candidate-metrics">
                        <span><strong>Est. Delay:</strong> +${c.estimatedPostActionDelayMin} min</span>
                        <span><strong>Saving:</strong> -${c.expectedDelayReductionMin} min</span>
                        <span><strong>Cost:</strong> RM${c.estimatedCostImpact.toFixed(2)}</span>
                        <span><strong>Confidence:</strong> ${(c.confidenceScore * 100).toFixed(0)}%</span>
                    </div>
                    <div style="font-size:0.75rem; color:var(--text-dim);"><em>${c.recommendationRationale}</em></div>
                </div>
            `;
        });

        detailContainer.innerHTML = `
            <div class="trip-header-info">
                <div class="trip-title">
                    <h2>${trip.tripId} — Route ${trip.routeId}</h2>
                    <div class="trip-meta-list">
                        <span><i class="fa-solid fa-bus"></i> Bus: ${trip.busId}</span>
                        <span><i class="fa-solid fa-users"></i> Load: ${trip.passengerLoad}%</span>
                        <span><i class="fa-solid fa-cloud-rain"></i> Weather: ${trip.weatherCondition}</span>
                    </div>
                </div>
                <div><span class="badge badge-${trip.riskLevel.toLowerCase()}">${trip.riskLevel} RISK</span></div>
            </div>

            <div class="prediction-banner">
                <div style="font-size:0.82rem; color:var(--text-muted);">PREDICTIVE DELAY INTELLIGENCE (DETECT & CATEGORISE)</div>
                <div class="pred-grid">
                    <div class="pred-box">
                        <label>Predicted Delay</label>
                        <span style="color:var(--danger);">+${trip.predictedDelayMinutes} min</span>
                    </div>
                    <div class="pred-box">
                        <label>Disruption Prob</label>
                        <span>${(trip.delayProbability * 100).toFixed(0)}%</span>
                    </div>
                    <div class="pred-box">
                        <label>Priority Rank Score</label>
                        <span style="color:var(--primary);">${trip.priorityScore}</span>
                    </div>
                </div>
                <div style="margin-top:0.75rem; font-size:0.82rem; color:var(--text-main); font-weight:500;">
                    <strong>Likely Root Cause:</strong> ${trip.delayCause}
                </div>
                <div style="font-size:0.78rem; color:var(--text-muted); margin-top:0.2rem;">${trip.explanationText}</div>
            </div>

            <div class="candidates-title"><i class="fa-solid fa-wand-magic-sparkles"></i> AI Recovery Candidate Optimization (Feature 2)</div>
            <div class="candidates-list">${candidatesHtml}</div>

            <div class="decision-control-box">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:0.88rem; font-weight:700;">EXECUTION POLICY & DECISION (FEATURE 3)</span>
                    ${decisionBadge}
                </div>
                <p style="font-size:0.8rem; color:var(--text-muted); margin-top:0.4rem;">
                    <strong>Selected Strategy:</strong> ${trip.selectedCandidate.title} (Delay Reduction: -${trip.selectedCandidate.expectedDelayReductionMin} min)
                </p>
                ${approvalControls}

                <div style="margin-top:1.25rem; padding-top:1rem; border-top:1px solid var(--border-color);">
                    <div style="font-size:0.82rem; font-weight:700; color:var(--text-main);">RECOVERY IMPACT VERIFICATION (FEATURE 4)</div>
                    <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-top:0.5rem;">
                        <span>Baseline Delay: +${trip.impact.baselineDelayMin} min</span>
                        <span style="color:var(--success); font-weight:700;">Post-Action Delay: +${trip.impact.postActionDelayMin} min</span>
                        <span>Saving: ${trip.impact.percentageImprovement}%</span>
                    </div>
                    <div class="impact-bar-container">
                        <div class="impact-bar-fill" style="width: ${Math.min(100, trip.impact.percentageImprovement)}%;"></div>
                    </div>
                    <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.4rem;">
                        <i class="fa-solid fa-circle-info"></i> ${trip.impact.verificationSummary}
                    </div>
                </div>
            </div>
        `;
    }

    window.approveTripAction = async function(tripId) {
        try {
            const res = await fetch(`/api/action/approve?tripId=${tripId}`, { method: 'POST' });
            const data = await res.json();
            
            showSuccessModal(data);
            await loadDashboardData();
            inspectTrip(tripId);
        } catch (e) {
            console.error(e);
            alert('Approval failed: ' + e.message);
        }
    };

    function showSuccessModal(data) {
        let existingModal = document.getElementById('success-action-modal');
        if (existingModal) existingModal.remove();

        let stepsHtml = '';
        if (data.movementSteps && data.movementSteps.length > 0) {
            data.movementSteps.forEach((step, idx) => {
                stepsHtml += `
                    <div class="step-item">
                        <div class="step-num">${idx + 1}</div>
                        <div class="step-text">${step}</div>
                    </div>
                `;
            });
        }

        const modalDiv = document.createElement('div');
        modalDiv.id = 'success-action-modal';
        modalDiv.className = 'modal-backdrop';
        modalDiv.innerHTML = `
            <div class="modal-card glass">
                <div class="modal-header">
                    <div class="modal-title">
                        <i class="fa-solid fa-circle-check icon-emerald" style="font-size:1.8rem;"></i>
                        <div>
                            <h3 style="font-size:1.2rem; font-family:var(--font-heading);">SUCCESSFUL INTERVENTION APPLIED!</h3>
                            <p style="font-size:0.8rem; color:var(--text-muted);">Trip ${data.tripId} (${data.busId}) • Route ${data.routeId}</p>
                        </div>
                    </div>
                    <button class="btn-close" onclick="document.getElementById('success-action-modal').remove()"><i class="fa-solid fa-xmark"></i></button>
                </div>

                <div class="modal-body">
                    <div class="kpi-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 1.25rem;">
                        <div class="pred-box">
                            <label>Delay Reduction</label>
                            <span style="color:var(--success); font-size:1.3rem;">-${data.delayReductionMin} min</span>
                        </div>
                        <div class="pred-box">
                            <label>Improvement</label>
                            <span style="color:var(--primary); font-size:1.3rem;">${data.percentageImprovement}%</span>
                        </div>
                        <div class="pred-box">
                            <label>Outcome Status</label>
                            <span style="color:var(--success); font-size:1.1rem;">${data.outcomeStatus}</span>
                        </div>
                    </div>

                    <div style="background:rgba(15,23,42,0.8); border:1px solid var(--border-color); padding:1rem; border-radius:12px; margin-bottom:1.25rem;">
                        <strong style="font-size:0.88rem; color:var(--text-main); display:block; margin-bottom:0.4rem;">
                            <i class="fa-solid fa-wand-magic-sparkles"></i> Executed Strategy: ${data.strategyTitle}
                        </strong>
                        <p style="font-size:0.8rem; color:var(--text-muted);">${data.verificationSummary}</p>
                    </div>

                    <div style="font-size:0.9rem; font-weight:700; margin-bottom:0.75rem; color:var(--text-main); display:flex; align-items:center; gap:0.5rem;">
                        <i class="fa-solid fa-route icon-blue"></i> HOW TO MOVE — Driver Navigation & Dispatch Steps:
                    </div>

                    <div class="movement-steps-list">
                        ${stepsHtml}
                    </div>
                </div>

                <div class="modal-footer" style="margin-top:1.5rem; text-align:right;">
                    <button class="btn btn-primary glow-btn" onclick="document.getElementById('success-action-modal').remove()">
                        <i class="fa-solid fa-check"></i> Acknowledge & Return to Workbench
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modalDiv);
    }

    window.rejectTripAction = async function(tripId) {
        try {
            await fetch(`/api/action/reject?tripId=${tripId}`, { method: 'POST' });
            await loadDashboardData();
            inspectTrip(tripId);
        } catch (e) {
            console.error(e);
        }
    };

    function initLeafletMap() {
        // Center around Kuala Lumpur (Rapid KL Hub)
        leafletMap = L.map('bus-map').setView([3.1390, 101.6869], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(leafletMap);

        currentTrips.forEach(trip => {
            // Find lat/lng
            fetch(`/api/trip-detail?tripId=${trip.tripId}`).then(r => r.json()).then(t => {
                if (t.latitude && t.longitude) {
                    const color = t.riskLevel === 'CRITICAL' ? '#8B5CF6' : (t.riskLevel === 'HIGH' ? '#EF4444' : '#10B981');
                    const marker = L.circleMarker([t.latitude, t.longitude], {
                        radius: 10,
                        fillColor: color,
                        color: '#ffffff',
                        weight: 2,
                        opacity: 1,
                        fillOpacity: 0.85
                    }).addTo(leafletMap);

                    marker.bindPopup(`
                        <strong>Trip ${t.tripId} (${t.busId})</strong><br>
                        Route ${t.routeId}: ${t.routeName}<br>
                        Predicted Delay: +${t.predictedDelayMinutes} min (${t.riskLevel} Risk)<br>
                        Cause: ${t.delayCause}<br>
                        <button style="margin-top:6px; cursor:pointer;" onclick="inspectTrip('${t.tripId}')">Inspect Action Plan</button>
                    `);
                    mapMarkers.push(marker);
                }
            });
        });
    }

    async function loadModelMetrics() {
        try {
            const res = await fetch('/api/model-metrics');
            const data = await res.json();
            document.getElementById('eval-mae').textContent = data.mae + ' min';
            document.getElementById('eval-rmse').textContent = data.rmse + ' min';
            document.getElementById('eval-precision').textContent = data.precision;
            document.getElementById('eval-recall').textContent = data.recall;
            document.getElementById('eval-f1').textContent = data.f1Score;

            document.getElementById('cm-tn').textContent = `True Negatives (TN): ${data.tn}`;
            document.getElementById('cm-fp').textContent = `False Positives (FP): ${data.fp}`;
            document.getElementById('cm-fn').textContent = `False Negatives (FN): ${data.fn}`;
            document.getElementById('cm-tp').textContent = `True Positives (TP): ${data.tp}`;
        } catch (e) {
            console.error(e);
        }
    }

    async function loadAuditLogs() {
        const tbody = document.getElementById('audit-table-body');
        try {
            const res = await fetch('/api/audit-logs');
            const logs = await res.json();
            if (logs.length === 0) {
                tbody.innerHTML = '<tr><td colspan="9" class="loading-cell">No audit log records found.</td></tr>';
                return;
            }

            tbody.innerHTML = '';
            logs.forEach(l => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><code>${l.auditId}</code></td>
                    <td>${l.timestamp.replace('T', ' ').substring(0, 19)}</td>
                    <td><strong>${l.tripId}</strong> (${l.routeId})</td>
                    <td>+${l.predictedDelayMin} min</td>
                    <td>${l.selectedStrategy}</td>
                    <td><span class="badge ${l.executionDecision === 'AUTO_EXECUTE' ? 'badge-auto' : 'badge-pending'}">${l.executionDecision}</span></td>
                    <td><strong>${l.actionStatus}</strong></td>
                    <td class="text-success">-${l.delayReductionMin} min (${l.percentageImprovement}%)</td>
                    <td style="font-size:0.75rem; max-width:250px;">${l.decisionRationale}</td>
                `;
                tbody.appendChild(tr);
            });
        } catch (e) {
            console.error(e);
        }
    }

    // AI Assistant Chat Widget Toggle & Messaging
    const aiTrigger = document.getElementById('ai-chat-trigger');
    const aiDrawer = document.getElementById('ai-chat-drawer');
    const aiClose = document.getElementById('ai-chat-close');
    const aiInput = document.getElementById('ai-chat-input');
    const aiSend = document.getElementById('ai-chat-send');
    const aiMessages = document.getElementById('ai-chat-messages');

    if (aiTrigger && aiDrawer && aiClose) {
        aiTrigger.addEventListener('click', () => {
            aiDrawer.classList.toggle('open');
        });

        aiClose.addEventListener('click', () => {
            aiDrawer.classList.remove('open');
        });

        const sendChatMessage = async () => {
            const text = aiInput.value.trim();
            if (!text) return;

            appendChatMessage('user', text);
            aiInput.value = '';

            const loadingBubble = appendChatMessage('ai', '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing with Groq LLaMA-3.3...');

            try {
                const res = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: text })
                });
                const data = await res.json();
                loadingBubble.innerHTML = data.reply ? data.reply.replace(/\n/g, '<br>') : 'Received reply.';
            } catch (e) {
                loadingBubble.innerHTML = 'Error communicating with AI Assistant: ' + e.message;
            }
        };

        if (aiSend) aiSend.addEventListener('click', sendChatMessage);
        if (aiInput) {
            aiInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') sendChatMessage();
            });
        }
    }

    function appendChatMessage(sender, htmlContent) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg msg-${sender}`;
        const icon = sender === 'ai' ? 'fa-robot' : 'fa-user';
        msgDiv.innerHTML = `
            <div class="msg-avatar"><i class="fa-solid ${icon}"></i></div>
            <div class="msg-bubble">${htmlContent}</div>
        `;
        aiMessages.appendChild(msgDiv);
        aiMessages.scrollTop = aiMessages.scrollHeight;
        return msgDiv.querySelector('.msg-bubble');
    }

    window.sendQuickPrompt = function(promptText) {
        if (aiDrawer) aiDrawer.classList.add('open');
        if (aiInput) {
            aiInput.value = promptText;
            if (aiSend) aiSend.click();
        }
    };

    // --- Station Finder & Alternative Options Logic ---
    let stationList = [];
    let currentStationFilter = 'ALL';

    async function loadStationDropdowns() {
        try {
            const res = await fetch('/api/stations');
            stationList = await res.json();
            
            populateStationSelects(stationList);
            renderStationDirectoryGrid(stationList);
            setupStationSearchEvents();
        } catch (e) {
            console.error('Failed to load stations:', e);
        }
    }

    function populateStationSelects(stations) {
        const origSelect = document.getElementById('select-origin-station');
        const destSelect = document.getElementById('select-dest-station');

        if (origSelect && destSelect && stations.length > 0) {
            const currentOrig = origSelect.value;
            const currentDest = destSelect.value;

            origSelect.innerHTML = '';
            destSelect.innerHTML = '';

            stations.forEach((s) => {
                const opt1 = document.createElement('option');
                opt1.value = s.stationId;
                opt1.textContent = `${s.stationName} (${s.district})`;
                origSelect.appendChild(opt1);

                const opt2 = document.createElement('option');
                opt2.value = s.stationId;
                opt2.textContent = `${s.stationName} (${s.district})`;
                destSelect.appendChild(opt2);
            });

            if (currentOrig && stations.some(s => s.stationId === currentOrig)) origSelect.value = currentOrig;
            if (currentDest && stations.some(s => s.stationId === currentDest)) destSelect.value = currentDest;
            else if (stations.length > 3) destSelect.selectedIndex = 3;
        }
    }

    function renderStationDirectoryGrid(stations) {
        const grid = document.getElementById('station-directory-grid');
        if (!grid) return;

        if (!stations || stations.length === 0) {
            grid.innerHTML = '<div class="placeholder-state" style="grid-column: 1 / -1;"><p>No station hubs match search criteria.</p></div>';
            return;
        }

        grid.innerHTML = '';
        stations.forEach(s => {
            let routeBadges = s.routesServed.map(r => `<span class="badge badge-low" style="font-size:0.7rem;">Route ${r}</span>`).join(' ');
            let transitBadges = s.transitConnections.map(t => `<span class="badge badge-auto" style="font-size:0.7rem; background:rgba(99,102,241,0.2); color:#A5B4FC;"><i class="fa-solid fa-train"></i> ${t}</span>`).join(' ');

            const card = document.createElement('div');
            card.className = 'glass';
            card.style.cssText = 'padding: 1.25rem; border-radius: 14px; border: 1px solid var(--border-color); background: rgba(30, 41, 59, 0.6); display: flex; flex-direction: column; justify-content: space-between; gap: 0.75rem;';
            card.innerHTML = `
                <div>
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <h4 style="font-size:1.05rem; font-family:var(--font-heading); color:#fff; font-weight:700;">
                            <i class="fa-solid fa-bus-simple icon-blue" style="margin-right:0.4rem;"></i> ${s.stationName}
                        </h4>
                        ${s.isDepotHub ? '<span class="badge badge-critical" style="font-size:0.68rem;"><i class="fa-solid fa-warehouse"></i> Depot Hub</span>' : ''}
                    </div>
                    <div style="font-size:0.78rem; color:var(--text-muted); margin-top:0.25rem;">
                        <i class="fa-solid fa-location-dot"></i> ${s.district} • GPS (${s.latitude.toFixed(3)}, ${s.longitude.toFixed(3)})
                    </div>
                    <p style="font-size:0.8rem; color:var(--text-dim); margin-top:0.5rem; line-height:1.35;">
                        ${s.description}
                    </p>
                    <div style="margin-top:0.6rem; display:flex; flex-wrap:wrap; gap:0.3rem;">
                        ${routeBadges}
                    </div>
                    <div style="margin-top:0.4rem; display:flex; flex-wrap:wrap; gap:0.3rem;">
                        ${transitBadges}
                    </div>
                </div>

                <div style="display:flex; gap:0.5rem; margin-top:0.5rem; padding-top:0.75rem; border-top:1px solid rgba(255,255,255,0.06);">
                    <button class="btn btn-secondary btn-sm" style="flex:1;" onclick="setOriginStation('${s.stationId}')">
                        <i class="fa-solid fa-location-dot icon-blue"></i> Set Origin
                    </button>
                    <button class="btn btn-primary btn-sm" style="flex:1;" onclick="setDestStation('${s.stationId}')">
                        <i class="fa-solid fa-flag-checkered icon-red"></i> Set Destination
                    </button>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    function setupStationSearchEvents() {
        const searchInput = document.getElementById('input-station-search');
        const clearBtn = document.getElementById('btn-clear-station-search');
        const filterChips = document.querySelectorAll('.chip-filter');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                filterStationDirectory();
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (searchInput) searchInput.value = '';
                filterStationDirectory();
            });
        }

        filterChips.forEach(chip => {
            chip.addEventListener('click', () => {
                filterChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                currentStationFilter = chip.getAttribute('data-filter');
                filterStationDirectory();
            });
        });
    }

    function filterStationDirectory() {
        const searchInput = document.getElementById('input-station-search');
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

        let filtered = stationList;

        // 1. Text filter
        if (query) {
            filtered = filtered.filter(s =>
                s.stationName.toLowerCase().includes(query) ||
                s.district.toLowerCase().includes(query) ||
                s.stationId.toLowerCase().includes(query) ||
                s.routesServed.some(r => r.toLowerCase().includes(query)) ||
                s.transitConnections.some(c => c.toLowerCase().includes(query))
            );
        }

        // 2. Category Chip filter
        if (currentStationFilter === 'DEPOT') {
            filtered = filtered.filter(s => s.isDepotHub);
        } else if (currentStationFilter === 'LRT') {
            filtered = filtered.filter(s => s.transitConnections.some(c => c.includes('LRT')));
        } else if (currentStationFilter === 'MRT') {
            filtered = filtered.filter(s => s.transitConnections.some(c => c.includes('MRT')));
        } else if (currentStationFilter === 'SELANGOR') {
            filtered = filtered.filter(s => s.district.includes('Subang') || s.district.includes('Puchong') || s.district.includes('Kajang') || s.district.includes('Shah Alam') || s.district.includes('Ampang') || s.district.includes('Petaling'));
        }

        renderStationDirectoryGrid(filtered);
    }

    window.setOriginStation = function(stationId) {
        const origSelect = document.getElementById('select-origin-station');
        if (origSelect) {
            origSelect.value = stationId;
            searchStationRoute();
        }
    };

    window.setDestStation = function(stationId) {
        const destSelect = document.getElementById('select-dest-station');
        if (destSelect) {
            destSelect.value = stationId;
            searchStationRoute();
        }
    };

    const btnSearchStation = document.getElementById('btn-search-station');
    if (btnSearchStation) {
        btnSearchStation.addEventListener('click', searchStationRoute);
    }

    async function searchStationRoute() {
        const origSelect = document.getElementById('select-origin-station');
        const destSelect = document.getElementById('select-dest-station');
        const resultsContainer = document.getElementById('station-results-container');

        if (!origSelect || !destSelect || !resultsContainer) return;

        const origin = origSelect.value;
        const destination = destSelect.value;

        resultsContainer.innerHTML = '<div class="placeholder-state"><i class="fa-solid fa-spinner fa-spin placeholder-icon"></i><p>Searching station routes & computing delay predictions...</p></div>';

        try {
            const res = await fetch(`/api/stations/search?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`);
            const data = await res.json();
            renderStationSearchResults(data);
        } catch (e) {
            console.error(e);
            resultsContainer.innerHTML = '<div class="placeholder-state text-danger"><p>Error fetching station search results.</p></div>';
        }
    }

    function renderStationSearchResults(data) {
        const resultsContainer = document.getElementById('station-results-container');
        if (!data || !data.originStation || !data.destinationStation) {
            resultsContainer.innerHTML = '<div class="placeholder-state text-danger"><p>No station data found.</p></div>';
            return;
        }

        const orig = data.originStation;
        const dest = data.destinationStation;
        const trip = data.matchedTrip || {};
        const pred = data.prediction || {};
        const alts = data.alternatives || [];
        const distKm = data.estimatedDistanceKm || 5.0;
        const baseFare = data.estimatedBaseFareMyr || 2.50;

        let riskBadgeClass = 'badge-low';
        if (pred.riskLevel === 'CRITICAL') riskBadgeClass = 'badge-critical';
        else if (pred.riskLevel === 'HIGH') riskBadgeClass = 'badge-high';
        else if (pred.riskLevel === 'MEDIUM') riskBadgeClass = 'badge-medium';

        let alternativesHtml = '';
        alts.forEach(alt => {
            alternativesHtml += `
                <div class="glass" style="padding:1.25rem; border-radius:12px; border:1px solid var(--border-color); background:rgba(30,41,59,0.7); display:flex; flex-direction:column; justify-content:space-between;">
                    <div>
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem;">
                            <h4 style="font-size:1.05rem; font-family:var(--font-heading); color:#fff;">
                                <i class="fa-solid ${alt.iconClass}"></i> ${alt.title}
                            </h4>
                            <span class="badge badge-auto" style="font-size:0.7rem;">${alt.badgeText}</span>
                        </div>
                        <p style="font-size:0.83rem; color:var(--text-muted); line-height:1.4; margin-bottom:0.75rem;">
                            ${alt.description}
                        </p>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; padding-top:0.6rem; border-top:1px solid rgba(255,255,255,0.08); font-size:0.8rem;">
                        <span><strong>Est. Delay:</strong> +${alt.estimatedDelayMin} min</span>
                        <span><strong>Fare:</strong> RM${(alt.estimatedFareMyr || baseFare).toFixed(2)}</span>
                        <span class="text-success"><strong>Saved:</strong> -${alt.timeSavedMin} min</span>
                    </div>
                </div>
            `;
        });

        resultsContainer.innerHTML = `
            <div class="glass" style="padding:1.25rem; border-radius:14px; border:1px solid var(--border-color); background:rgba(15,23,42,0.85); margin-bottom:1.5rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; margin-bottom:1rem;">
                    <div>
                        <span style="font-size:0.75rem; text-transform:uppercase; letter-spacing:1px; color:var(--text-muted);">JOURNEY CORRIDOR DIRECT BUS TRIP</span>
                        <h3 style="font-size:1.3rem; font-family:var(--font-heading); color:#fff; margin-top:0.2rem;">
                            ${orig.stationName} <i class="fa-solid fa-arrow-right icon-purple" style="font-size:0.9rem; margin:0 0.4rem;"></i> ${dest.stationName}
                        </h3>
                        <div style="font-size:0.8rem; color:var(--text-muted); margin-top:0.2rem;">
                            <i class="fa-solid fa-bus"></i> Route ${trip.routeId || 'N/A'}: ${trip.routeName || 'Direct Bus Service'} • Bus ID: ${trip.busId || 'MYB-KL'}
                        </div>
                    </div>
                    <div>
                        <span class="badge ${riskBadgeClass}" style="font-size:0.95rem; padding:0.5rem 1rem;">${pred.riskLevel || 'NORMAL'} RISK</span>
                    </div>
                </div>

                <div class="kpi-grid" style="grid-template-columns: repeat(5, 1fr); margin-bottom:1rem;">
                    <div class="pred-box">
                        <label>Predicted Delay</label>
                        <span style="color:var(--danger); font-size:1.3rem;">+${pred.predictedDelayMinutes || 0} min</span>
                    </div>
                    <div class="pred-box">
                        <label>Disruption Prob</label>
                        <span style="font-size:1.3rem;">${((pred.delayProbability || 0) * 100).toFixed(0)}%</span>
                    </div>
                    <div class="pred-box">
                        <label>Distance</label>
                        <span style="font-size:1.3rem; color:var(--primary);">${distKm} km</span>
                    </div>
                    <div class="pred-box">
                        <label>Est. Bus Fare</label>
                        <span style="font-size:1.3rem; color:var(--success);">RM${baseFare.toFixed(2)}</span>
                    </div>
                    <div class="pred-box">
                        <label>Bottleneck</label>
                        <span style="color:var(--warning); font-size:0.9rem; font-weight:700;">${trip.delayCause || pred.primaryFactor || 'Traffic'}</span>
                    </div>
                </div>

                <div style="font-size:0.83rem; color:var(--text-main); background:rgba(255,255,255,0.04); padding:0.75rem 1rem; border-radius:8px; border-left:3px solid var(--primary);">
                    <i class="fa-solid fa-circle-info"></i> ${data.summaryRationale}
                </div>
            </div>

            <div style="margin-bottom:1rem;">
                <h3 style="font-size:1.1rem; font-family:var(--font-heading); color:#fff; display:flex; align-items:center; gap:0.5rem; margin-bottom:0.75rem;">
                    <i class="fa-solid fa-wand-magic-sparkles icon-purple"></i> Recommended Alternative Travel Options (${alts.length} Available)
                </h3>
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:1rem;">
                    ${alternativesHtml}
                </div>
            </div>
        `;
    }
});
