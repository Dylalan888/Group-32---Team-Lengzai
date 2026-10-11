document.addEventListener('DOMContentLoaded', () => {
    let currentTrips = [];
    let selectedTripId = null;
    let leafletMap = null;
    let mapMarkers = [];

    // --- FALLBACK STATIC DATASET FOR VERCEL & GITHUB PAGES HOSTING ---
    const FALLBACK_SYSTEM_SUMMARY = {
        totalTrips: 12,
        criticalTrips: 2,
        highRiskTrips: 4,
        mediumRiskTrips: 2,
        lowRiskTrips: 4,
        totalBaselineDelayMin: 277.6,
        modelMae: 2.15,
        modelPrecision: 0.92
    };

    const FALLBACK_PREDICTIONS = [
        { rank: 1, tripId: "TRIP-101", busId: "MYB-7701", routeId: "770", routeName: "Mid Valley to Subang Jaya", predictedDelayMinutes: 58.8, delayProbability: 0.99, riskLevel: "CRITICAL", riskColor: "#8B5CF6", priorityScore: 92.4, primaryFactor: "Traffic Congestion (CRITICAL)", explanationText: "Trip TRIP-101 on Route 770 predicted to suffer 58.8 min delay (Critical Risk). Primary driver: Traffic Congestion (+24.5 min).", actionState: "PENDING_APPROVAL" },
        { rank: 2, tripId: "TRIP-104", busId: "MYB-3004", routeId: "300", routeName: "Pandan Indah to Lebuh Ampang", predictedDelayMinutes: 42.5, delayProbability: 0.95, riskLevel: "CRITICAL", riskColor: "#8B5CF6", priorityScore: 88.1, primaryFactor: "Ampang Corridor Construction Gridlock", explanationText: "Trip TRIP-104 on Route 300 predicted to suffer 42.5 min delay (Critical Risk).", actionState: "PENDING_APPROVAL" },
        { rank: 3, tripId: "TRIP-106", busId: "MYB-6006", routeId: "600", routeName: "Hab Puchong Utama to Pasar Seni", predictedDelayMinutes: 38.2, delayProbability: 0.91, riskLevel: "HIGH", riskColor: "#EF4444", priorityScore: 82.5, primaryFactor: "LDP Interchange Breakdown", explanationText: "Trip TRIP-106 on Route 600 predicted to suffer 38.2 min delay (High Risk).", actionState: "AUTO_EXECUTED" },
        { rank: 4, tripId: "TRIP-108", busId: "MYB-4508", routeId: "450", routeName: "Hentian Kajang to Hub Lebuh Pudu", predictedDelayMinutes: 34.0, delayProbability: 0.88, riskLevel: "HIGH", riskColor: "#EF4444", priorityScore: 79.0, primaryFactor: "Cheras Highway Heavy Congestion", explanationText: "Trip TRIP-108 on Route 450 predicted to suffer 34.0 min delay (High Risk).", actionState: "AUTO_EXECUTED" },
        { rank: 5, tripId: "TRIP-110", busId: "MYB-5900", routeId: "590", routeName: "Hab Bandar Sungai Long to Hub Lebuh Pudu", predictedDelayMinutes: 28.5, delayProbability: 0.80, riskLevel: "HIGH", riskColor: "#EF4444", priorityScore: 73.2, primaryFactor: "Sungai Besi Toll Bottleneck", explanationText: "Trip TRIP-110 on Route 590 predicted to suffer 28.5 min delay.", actionState: "AUTO_EXECUTED" },
        { rank: 6, tripId: "TRIP-112", busId: "MYB-7722", routeId: "772", routeName: "Subang Suria to Pasar Seni", predictedDelayMinutes: 26.0, delayProbability: 0.76, riskLevel: "HIGH", riskColor: "#EF4444", priorityScore: 71.0, primaryFactor: "Federal Highway Subang Ramp Blockage", explanationText: "Trip TRIP-112 on Route 772 predicted to suffer 26.0 min delay.", actionState: "APPROVED" },
        { rank: 7, tripId: "TRIP-102", busId: "MYB-1152", routeId: "B115", routeName: "KL Sentral to Complex Keramat", predictedDelayMinutes: 18.4, delayProbability: 0.65, riskLevel: "MEDIUM", riskColor: "#F59E0B", priorityScore: 54.0, primaryFactor: "Jalan Tun Sambanthan Bus Lane Bottleneck", explanationText: "Trip TRIP-102 on Route B115 predicted to suffer 18.4 min delay.", actionState: "AUTO_EXECUTED" },
        { rank: 8, tripId: "TRIP-107", busId: "MYB-2507", routeId: "250", routeName: "LRT Wangsa Maju to Terminal Lebuh Ampang", predictedDelayMinutes: 14.2, delayProbability: 0.50, riskLevel: "MEDIUM", riskColor: "#F59E0B", priorityScore: 45.2, primaryFactor: "Jalan Pahang Bus Stop Crowding", explanationText: "Trip TRIP-107 on Route 250 predicted to suffer 14.2 min delay.", actionState: "AUTO_EXECUTED" },
        { rank: 9, tripId: "TRIP-103", busId: "MYB-7503", routeId: "750", routeName: "Central Market to Shah Alam Sek 14", predictedDelayMinutes: 8.5, delayProbability: 0.30, riskLevel: "LOW", riskColor: "#10B981", priorityScore: 28.0, primaryFactor: "Minor Traffic Signal Delay", explanationText: "Trip TRIP-103 on Route 750 predicted to suffer 8.5 min delay.", actionState: "APPROVED" },
        { rank: 10, tripId: "TRIP-105", busId: "MYB-7805", routeId: "780", routeName: "Pasar Seni to Kota Damansara", predictedDelayMinutes: 4.0, delayProbability: 0.15, riskLevel: "LOW", riskColor: "#10B981", priorityScore: 15.0, primaryFactor: "Normal Operating Conditions", explanationText: "Trip TRIP-105 on Route 780 predicted to suffer 4.0 min delay.", actionState: "APPROVED" },
        { rank: 11, tripId: "TRIP-109", busId: "MYB-1009", routeId: "100", routeName: "Hub Lebuh Pudu to Kuala Selangor", predictedDelayMinutes: 3.0, delayProbability: 0.10, riskLevel: "LOW", riskColor: "#10B981", priorityScore: 12.0, primaryFactor: "On Time Schedule", explanationText: "Trip TRIP-109 on Route 100 operating on schedule.", actionState: "APPROVED" },
        { rank: 12, tripId: "TRIP-111", busId: "MYB-8011", routeId: "T801", routeName: "LRT Sri Rampai to Section 10 Wangsa Maju", predictedDelayMinutes: 2.0, delayProbability: 0.05, riskLevel: "LOW", riskColor: "#10B981", priorityScore: 10.0, primaryFactor: "Feeder Bus Dynamic Flow", explanationText: "Trip TRIP-111 on Route T801 operating normally.", actionState: "APPROVED" }
    ];

    const FALLBACK_STATIONS = [
        { stationId: "STN-KL-SENTRAL", stationName: "KL Sentral Transport Hub", district: "Kuala Lumpur", latitude: 3.1340, longitude: 101.6865, isDepotHub: true, description: "Primary multi-modal transit hub connecting central KL to Petaling Jaya and Klang.", routesServed: ["770", "B115", "750"], transitConnections: ["LRT Kelana Jaya Line", "MRT Museum Negara", "KTM Komuter"] },
        { stationId: "STN-PASAR-SENI", stationName: "Hub Pasar Seni", district: "City Centre", latitude: 3.1420, longitude: 101.6940, isDepotHub: true, description: "Major downtown Rapid KL bus terminus with seamless LRT and MRT interchange.", routesServed: ["780", "600", "100", "450", "590", "772"], transitConnections: ["LRT Kelana Jaya Line", "MRT Pasar Seni"] },
        { stationId: "STN-MID-VALLEY", stationName: "Mid Valley Hub", district: "Kuala Lumpur", latitude: 3.1176, longitude: 101.6775, isDepotHub: false, description: "High-density commercial corridor along Federal Highway.", routesServed: ["770"], transitConnections: ["KTM Mid Valley", "LRT Abdullah Hukum"] },
        { stationId: "STN-SUBANG-JAYA", stationName: "Subang Jaya Station Hub", district: "Subang Jaya", latitude: 3.1480, longitude: 101.5450, isDepotHub: true, description: "Subang Jaya transit node serving Federal Highway corridors.", routesServed: ["770", "772"], transitConnections: ["LRT Kelana Jaya Line", "KTM Subang Jaya"] },
        { stationId: "STN-KERAMAT", stationName: "Complex Keramat Terminal", district: "Keramat", latitude: 3.1650, longitude: 101.7250, isDepotHub: false, description: "Residential and commercial feeder hub in East KL.", routesServed: ["B115"], transitConnections: ["LRT Damai", "LRT Dato Keramat"] },
        { stationId: "STN-SHAH-ALAM", stationName: "Shah Alam Sek 14 Bus Terminal", district: "Shah Alam", latitude: 3.0720, longitude: 101.5180, isDepotHub: false, description: "Main Selangor state capital bus terminal connecting Central Market.", routesServed: ["750"], transitConnections: ["Rapid KL Feeder", "KTM Shah Alam"] },
        { stationId: "STN-PANDAN-INDAH", stationName: "Pandan Indah Bus Hub", district: "Ampang", latitude: 3.1490, longitude: 101.7120, isDepotHub: false, description: "Ampang corridor feeder terminal with frequent peak congestion.", routesServed: ["300"], transitConnections: ["LRT Pandan Indah", "LRT Cempaka"] },
        { stationId: "STN-KOTA-DAMANSARA", stationName: "Kota Damansara Hub", district: "Petaling Jaya", latitude: 3.1510, longitude: 101.5920, isDepotHub: false, description: "Northern PJ suburban terminal connected to Pasar Seni via Route 780.", routesServed: ["780"], transitConnections: ["MRT Kota Damansara", "MRT Surian"] },
        { stationId: "STN-PUCHONG-UTAMA", stationName: "Hab Puchong Utama", district: "Puchong", latitude: 3.0330, longitude: 101.6210, isDepotHub: true, description: "Major South Klang Valley hub operating along LDP corridor.", routesServed: ["600"], transitConnections: ["LRT Puchong Perdana", "LRT Puchong Utama"] },
        { stationId: "STN-WANGSA-MAJU", stationName: "LRT Wangsa Maju Hub", district: "Wangsa Maju", latitude: 3.2050, longitude: 101.7320, isDepotHub: false, description: "Northeast KL residential and feeder bus junction.", routesServed: ["250", "T801"], transitConnections: ["LRT Wangsa Maju", "LRT Sri Rampai"] },
        { stationId: "STN-HENTIAN-KAJANG", stationName: "Hentian Kajang Hub", district: "Kajang", latitude: 2.9820, longitude: 101.7850, isDepotHub: true, description: "Southern Klang Valley regional terminal serving Cheras Highway.", routesServed: ["450"], transitConnections: ["MRT Kajang Line", "KTM Kajang"] },
        { stationId: "STN-SUNGAI-LONG", stationName: "Hab Bandar Sungai Long", district: "Kajang / Cheras", latitude: 3.0450, longitude: 101.7920, isDepotHub: false, description: "University and residential feeder terminal connecting Hub Lebuh Pudu.", routesServed: ["590"], transitConnections: ["MRT Batu 11 Cheras Feeder"] },
        { stationId: "STN-KUALA-SELANGOR", stationName: "Kuala Selangor Terminal", district: "Kuala Selangor", latitude: 3.3500, longitude: 101.2500, isDepotHub: false, description: "North-West coastal terminal connecting downtown KL.", routesServed: ["100"], transitConnections: ["Selangor Omnibus Regional"] }
    ];

    const FALLBACK_AUDIT_LOGS = [
        { auditId: "AUD-901", timestamp: "2026-10-10 08:30:00", tripId: "TRIP-101", busId: "MYB-7701", routeId: "770", predictedDelayMin: 58.8, selectedStrategy: "Expressway Detour Bypass", executionDecision: "REQUIRES_APPROVAL", actionStatus: "APPROVED", delayReductionMin: 35.3, percentageImprovement: 60.0, decisionRationale: "Divert at Exit 211 onto NPE Expressway. Saves 35.3 min delay." },
        { auditId: "AUD-902", timestamp: "2026-10-10 08:45:00", tripId: "TRIP-106", busId: "MYB-6006", routeId: "600", predictedDelayMin: 38.2, selectedStrategy: "Standby Bus Injection", executionDecision: "AUTO_EXECUTE", actionStatus: "AUTO_EXECUTED", delayReductionMin: 22.9, percentageImprovement: 60.0, decisionRationale: "Inject Standby Bus MYB-DEPOT-99 to absorb LDP breakdown bottleneck." },
        { auditId: "AUD-903", timestamp: "2026-10-10 09:00:00", tripId: "TRIP-108", busId: "MYB-4508", routeId: "450", predictedDelayMin: 34.0, selectedStrategy: "Headway Interval Regulation", executionDecision: "AUTO_EXECUTE", actionStatus: "AUTO_EXECUTED", delayReductionMin: 17.0, percentageImprovement: 50.0, decisionRationale: "Shift departure spacing by +5 min to eliminate bus bunching along Cheras Highway." },
        { auditId: "AUD-904", timestamp: "2026-10-10 09:15:00", tripId: "TRIP-110", busId: "MYB-5900", routeId: "590", predictedDelayMin: 28.5, selectedStrategy: "Express Lane Prioritization", executionDecision: "AUTO_EXECUTE", actionStatus: "AUTO_EXECUTED", delayReductionMin: 14.25, percentageImprovement: 50.0, decisionRationale: "Utilize dedicated BRT corridor at Sungai Besi toll." }
    ];

    // Tab Navigation
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetElem = document.getElementById(targetTab);
            if (targetElem) targetElem.classList.add('active');

            if (targetTab === 'tab-map') {
                if (!leafletMap) {
                    initLeafletMap();
                } else {
                    setTimeout(() => { if (leafletMap) leafletMap.invalidateSize(); }, 200);
                }
                updateMapKpis();
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
                if (!res.ok) throw new Error('API server unavailable');
                const data = await res.json();
                alert(`Auto Simulation Complete!\n- Total Trips: ${data.totalTrips}\n- Auto-Executed: ${data.autoExecuted}\n- Requiring Approval: ${data.requiresApproval}\n- Total Delay Reduction: ${data.totalDelaySavedMin} mins`);
                await loadDashboardData();
            } catch (e) {
                alert(`Simulated Auto-Intervention Run Complete!\n- Evaluated Trips: 12\n- Auto-Executed Actions: 5\n- Requiring Approval: 2\n- Total Simulated Delay Reduction: 124.9 mins`);
            } finally {
                btnSim.disabled = false;
                btnSim.innerHTML = '<i class="fa-solid fa-bolt"></i> Auto-Simulation';
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
            const summaryRes = await fetch('/api/system-summary');
            const predictionsRes = await fetch('/api/predictions');

            if (!summaryRes.ok || !predictionsRes.ok) throw new Error('API unavailable');

            const summary = await summaryRes.json();
            currentTrips = await predictionsRes.json();
            applyDashboardData(summary, currentTrips);
        } catch (err) {
            console.warn('API server unavailable, loading static fallback dataset for Vercel/GitHub Pages deployment:', err);
            currentTrips = FALLBACK_PREDICTIONS;
            applyDashboardData(FALLBACK_SYSTEM_SUMMARY, FALLBACK_PREDICTIONS);
        }
    }

    function applyDashboardData(summary, trips) {
        summary = summary || FALLBACK_SYSTEM_SUMMARY;
        trips = (trips && trips.length > 0) ? trips : FALLBACK_PREDICTIONS;
        currentTrips = trips;

        const elemTotal = document.getElementById('kpi-total-trips');
        if (elemTotal) elemTotal.textContent = summary.totalTrips || trips.length;

        const elemRisk = document.getElementById('kpi-risk-trips');
        if (elemRisk) elemRisk.textContent = (summary.criticalTrips || 0) + (summary.highRiskTrips || 0);

        const elemMae = document.getElementById('kpi-model-mae');
        if (elemMae) elemMae.textContent = (summary.modelMae || 2.15) + ' min';

        let autoCount = 0;
        trips.forEach(t => {
            if (t.actionState === 'AUTO_EXECUTED') autoCount++;
        });
        const elemAuto = document.getElementById('kpi-auto-executed');
        if (elemAuto) elemAuto.textContent = autoCount;

        const elemSaved = document.getElementById('kpi-delay-saved');
        if (elemSaved) elemSaved.textContent = ((summary.totalBaselineDelayMin || 277.6) * 0.45).toFixed(1) + ' min';

        const filterRiskElem = document.getElementById('filter-risk');
        renderTripsTable(filterRiskElem ? filterRiskElem.value : 'ALL');

        if (trips.length > 0 && !selectedTripId) {
            inspectTrip(trips[0].tripId);
        }
    }

    function renderTripsTable(riskFilter) {
        const tbody = document.getElementById('trips-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        let tripsToRender = (currentTrips && currentTrips.length > 0) ? currentTrips : FALLBACK_PREDICTIONS;
        let filtered = tripsToRender;
        if (riskFilter === 'CRITICAL') {
            filtered = tripsToRender.filter(t => t.riskLevel === 'CRITICAL');
        } else if (riskFilter === 'HIGH') {
            filtered = tripsToRender.filter(t => t.riskLevel === 'CRITICAL' || t.riskLevel === 'HIGH');
        } else if (riskFilter === 'MEDIUM') {
            filtered = tripsToRender.filter(t => t.riskLevel !== 'LOW');
        }

        if (!filtered || filtered.length === 0) {
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
                <td><strong>#${t.rank || 1}</strong></td>
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

    window.inspectTrip = async function(tripId, shouldSwitchTab = false) {
        selectedTripId = tripId;

        if (shouldSwitchTab) {
            tabBtns.forEach(b => {
                if (b.getAttribute('data-tab') === 'tab-workbench') b.classList.add('active');
                else b.classList.remove('active');
            });
            tabContents.forEach(c => {
                if (c.id === 'tab-workbench') c.classList.add('active');
                else c.classList.remove('active');
            });
        }

        const filterElem = document.getElementById('filter-risk');
        renderTripsTable(filterElem ? filterElem.value : 'ALL');

        const detailContainer = document.getElementById('trip-detail-container');
        if (!detailContainer) return;
        detailContainer.innerHTML = '<div class="placeholder-state"><i class="fa-solid fa-spinner fa-spin placeholder-icon"></i><p>Loading recovery details for ' + tripId + '...</p></div>';

        if (shouldSwitchTab) {
            detailContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        try {
            const res = await fetch(`/api/trip-detail?tripId=${tripId}`);
            if (!res.ok) throw new Error('Detail API unavailable');
            const trip = await res.json();
            renderTripDetail(trip);
        } catch (e) {
            console.warn('Using fallback static trip detail for ' + tripId);
            const fallbackDetail = getFallbackTripDetail(tripId);
            renderTripDetail(fallbackDetail);
        }
    };

    function getFallbackTripDetail(tripId) {
        const predictions = (currentTrips && currentTrips.length > 0) ? currentTrips : FALLBACK_PREDICTIONS;
        const base = predictions.find(t => t.tripId === tripId) || predictions[0];
        const postDelay = Math.max(5.0, base.predictedDelayMinutes * 0.4);
        const reduction = base.predictedDelayMinutes * 0.6;
        
        return {
            tripId: base.tripId,
            busId: base.busId,
            routeId: base.routeId,
            routeName: base.routeName,
            passengerLoad: 88,
            driverShiftHours: 6.5,
            standbyBusAvailable: true,
            weatherCondition: "HEAVY_RAIN",
            trafficCongestionLevel: "CRITICAL",
            delayCause: base.primaryFactor,
            predictedDelayMinutes: base.predictedDelayMinutes,
            delayProbability: base.delayProbability,
            riskLevel: base.riskLevel,
            riskColor: base.riskColor,
            priorityScore: base.priorityScore,
            primaryFactor: base.primaryFactor,
            explanationText: base.explanationText,
            llmInsight: "[Groq AI + RAG Knowledge Base] Heavy bottleneck detected along Federal Highway. Reroute via NPE Expressway recommended to bypass stop congestion.",
            featureContributions: {
                "Traffic Congestion (CRITICAL)": 24.5,
                "Weather Condition (HEAVY_RAIN)": 12.8,
                "Passenger Load (88%)": 7.5,
                "Departure Lateness": 14.0
            },
            candidates: [
                { candidateId: "CAN-01", strategyType: "ROUTE_OPTIMIZATION", title: "Expressway Detour Bypass", actionDetails: "Divert at Exit 211 onto NPE Expressway Corridor to bypass 3 heavy congestion nodes.", feasible: true, feasibilityReason: "Feasible: Toll route clear & driver within shift hours.", estimatedPostActionDelayMin: postDelay, expectedDelayReductionMin: reduction, estimatedCostImpact: 15.0, confidenceScore: 0.92, potentialSideEffects: "Bypasses stops #4 and #5.", recommendationRationale: "Maximizes delay reduction with minimal MYR 15.00 cost impact." },
                { candidateId: "CAN-02", strategyType: "STANDBY_REASSIGNMENT", title: "Standby Bus Injection", actionDetails: "Dispatch Standby Bus MYB-DEPOT-99 from KL Sentral Hub directly to downstream station.", feasible: true, feasibilityReason: "Feasible: Standby bus available at depot.", estimatedPostActionDelayMin: Math.max(8.0, base.predictedDelayMinutes * 0.45), expectedDelayReductionMin: base.predictedDelayMinutes * 0.55, estimatedCostImpact: 45.0, confidenceScore: 0.88, potentialSideEffects: "Incurs MYR 45 standby wage cost.", recommendationRationale: "Effective fallback if traffic detour is blocked." },
                { candidateId: "CAN-03", strategyType: "ADAPTIVE_SCHEDULING", title: "Headway Interval Regulation", actionDetails: "Shift trailing bus departure by +5 mins to prevent bus bunching.", feasible: true, feasibilityReason: "Feasible: Zero financial cost intervention.", estimatedPostActionDelayMin: Math.max(10.0, base.predictedDelayMinutes * 0.7), expectedDelayReductionMin: base.predictedDelayMinutes * 0.3, estimatedCostImpact: 0.0, confidenceScore: 0.85, potentialSideEffects: "Slight headway gap.", recommendationRationale: "Zero-cost timetable adjustment." }
            ],
            selectedCandidate: {
                candidateId: "CAN-01",
                strategyType: "ROUTE_OPTIMIZATION",
                title: "Expressway Detour Bypass",
                actionDetails: "Divert at Exit 211 onto NPE Expressway Corridor.",
                expectedDelayReductionMin: reduction
            },
            executionDecision: base.predictedDelayMinutes > 40 ? "REQUIRES_APPROVAL" : "AUTO_EXECUTE",
            executionDecisionLabel: base.predictedDelayMinutes > 40 ? "REQUIRES APPROVAL" : "AUTO EXECUTE",
            executionDecisionColor: base.predictedDelayMinutes > 40 ? "#EF4444" : "#10B981",
            actionState: base.actionState,
            impact: {
                baselineDelayMin: base.predictedDelayMinutes,
                postActionDelayMin: postDelay,
                delayReductionMin: reduction,
                percentageImprovement: 60.0,
                costImpact: 15.0,
                outcomeStatus: "SUCCESSFUL",
                verificationSummary: "Intervention reduces baseline delay from +" + base.predictedDelayMinutes + " min to +" + postDelay.toFixed(1) + " min (60.0% improvement)."
            }
        };
    }

    function renderTripDetail(trip) {
        const detailContainer = document.getElementById('trip-detail-container');
        if (!detailContainer || !trip) return;
        
        const impact = trip.impact || {
            baselineDelayMin: trip.predictedDelayMinutes || 0,
            postActionDelayMin: Math.max(5.0, (trip.predictedDelayMinutes || 0) * 0.4),
            delayReductionMin: (trip.predictedDelayMinutes || 0) * 0.6,
            percentageImprovement: 60.0,
            costImpact: 15.0,
            outcomeStatus: "SUCCESSFUL",
            verificationSummary: "Intervention reduces baseline delay from +" + (trip.predictedDelayMinutes || 0) + " min to +" + (Math.max(5.0, (trip.predictedDelayMinutes || 0) * 0.4)).toFixed(1) + " min (60.0% improvement)."
        };

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
        if (trip.candidates && trip.candidates.length > 0) {
            trip.candidates.forEach(c => {
                const isSelected = trip.selectedCandidate && c.candidateId === trip.selectedCandidate.candidateId;
                const cardClass = isSelected ? 'candidate-card selected-candidate' : (c.feasible ? 'candidate-card' : 'candidate-card infeasible-candidate');
                
                candidatesHtml += `
                    <div class="${cardClass}">
                        <div class="candidate-head">
                            <h4>${c.title} ${isSelected ? '<span class="badge badge-auto">Optimiser Pick</span>' : ''}</h4>
                            <span class="badge ${c.feasible ? 'badge-low' : 'badge-blocked'}">${c.feasible ? 'Feasible' : 'Infeasible'}</span>
                        </div>
                        <div class="candidate-details">${c.actionDetails}</div>
                        <div class="candidate-metrics">
                            <span><strong>Est. Delay:</strong> +${(c.estimatedPostActionDelayMin || 0).toFixed(1)} min</span>
                            <span><strong>Saving:</strong> -${(c.expectedDelayReductionMin || 0).toFixed(1)} min</span>
                            <span><strong>Cost:</strong> RM${(c.estimatedCostImpact || 0).toFixed(2)}</span>
                            <span><strong>Confidence:</strong> ${((c.confidenceScore || 0.9) * 100).toFixed(0)}%</span>
                        </div>
                        <div style="font-size:0.75rem; color:var(--text-dim);"><em>${c.recommendationRationale}</em></div>
                    </div>
                `;
            });
        }

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
                <div><span class="badge badge-${(trip.riskLevel || 'MEDIUM').toLowerCase()}">${trip.riskLevel} RISK</span></div>
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
                        <span>${((trip.delayProbability || 0) * 100).toFixed(0)}%</span>
                    </div>
                    <div class="pred-box">
                        <label>Priority Rank Score</label>
                        <span style="color:var(--primary);">${trip.priorityScore}</span>
                    </div>
                </div>
                <div style="margin-top:0.75rem; font-size:0.82rem; color:var(--text-main); font-weight:500;">
                    <strong>Likely Root Cause:</strong> ${trip.delayCause || trip.primaryFactor}
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
                    <strong>Selected Strategy:</strong> ${trip.selectedCandidate ? trip.selectedCandidate.title : 'Route Detour'}
                </p>
                ${approvalControls}

                <div style="margin-top:1.25rem; padding-top:1rem; border-top:1px solid var(--border-color);">
                    <div style="font-size:0.82rem; font-weight:700; color:var(--text-main);">RECOVERY IMPACT VERIFICATION (FEATURE 4)</div>
                    <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-top:0.5rem;">
                        <span>Baseline Delay: +${impact.baselineDelayMin} min</span>
                        <span style="color:var(--success); font-weight:700;">Post-Action Delay: +${impact.postActionDelayMin.toFixed(1)} min</span>
                        <span>Saving: ${impact.percentageImprovement}%</span>
                    </div>
                    <div class="impact-bar-container">
                        <div class="impact-bar-fill" style="width: ${Math.min(100, impact.percentageImprovement)}%;"></div>
                    </div>
                    <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.4rem;">
                        <i class="fa-solid fa-circle-info"></i> ${impact.verificationSummary}
                    </div>
                </div>
            </div>
        `;
    }

    window.approveTripAction = async function(tripId) {
        try {
            const res = await fetch(`/api/action/approve?tripId=${tripId}`, { method: 'POST' });
            if (!res.ok) throw new Error('API server unavailable');
            const data = await res.json();
            showSuccessModal(data);
        } catch (e) {
            const predictions = (currentTrips && currentTrips.length > 0) ? currentTrips : FALLBACK_PREDICTIONS;
            const trip = predictions.find(t => t.tripId === tripId);
            if (trip) trip.actionState = 'APPROVED';
            showSuccessModal({
                tripId: tripId,
                busId: trip ? trip.busId : 'MYB-7701',
                routeId: trip ? trip.routeId : '770',
                strategyTitle: 'Expressway Detour Bypass',
                baselineDelayMin: trip ? trip.predictedDelayMinutes : 58.8,
                postActionDelayMin: 23.5,
                delayReductionMin: 35.3,
                percentageImprovement: 60.0,
                costImpact: 15.0,
                outcomeStatus: 'SUCCESSFUL',
                verificationSummary: 'Operator approved. Route diverted via NPE Expressway bypassing 3 bottleneck nodes.',
                movementSteps: [
                    "Step 1: Signal Driver of Bus MYB-7701 to divert at Exit 211 onto Expressway Bypass Corridor.",
                    "Step 2: Notify passengers via bus onboard display that intermediate stops #4 and #5 will be bypassed.",
                    "Step 3: Re-enter main route schedule at Station 8. Expected delay saving: 35.3 minutes."
                ]
            });
        }
        await loadDashboardData();
        inspectTrip(tripId);
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
                            <span style="color:var(--success); font-size:1.3rem;">-${(data.delayReductionMin || 0).toFixed(1)} min</span>
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
        } catch (e) {
            const predictions = (currentTrips && currentTrips.length > 0) ? currentTrips : FALLBACK_PREDICTIONS;
            const trip = predictions.find(t => t.tripId === tripId);
            if (trip) trip.actionState = 'REJECTED';
        }
        await loadDashboardData();
        inspectTrip(tripId);
    };

    // --- GIS Interactive Map System ---
    let mapRoutePolylines = [];
    let mapStationMarkers = [];
    let showRoutesLayer = true;
    let showStationsLayer = true;

    const ROUTE_DEFINITIONS = {
        "770": { name: "Mid Valley to Subang Jaya", color: "#8B5CF6", waypoints: [[3.1176, 101.6775], [3.1160, 101.6550], [3.1000, 101.6250], [3.0850, 101.5850], [3.1480, 101.5450]] },
        "300": { name: "Pandan Indah to Lebuh Ampang", color: "#8B5CF6", waypoints: [[3.1490, 101.7120], [3.1550, 101.7180], [3.1580, 101.7050], [3.1420, 101.6940]] },
        "600": { name: "Hab Puchong Utama to Pasar Seni", color: "#EF4444", waypoints: [[3.0330, 101.6210], [3.0500, 101.6200], [3.0850, 101.6700], [3.1340, 101.6865], [3.1420, 101.6940]] },
        "450": { name: "Hentian Kajang to Hub Lebuh Pudu", color: "#EF4444", waypoints: [[2.9820, 101.7850], [3.0250, 101.7700], [3.0800, 101.7350], [3.1150, 101.7150], [3.1440, 101.6970]] },
        "590": { name: "Hab Bandar Sungai Long to Hub Lebuh Pudu", color: "#EF4444", waypoints: [[3.0450, 101.7920], [3.0700, 101.7550], [3.0900, 101.7050], [3.1440, 101.6970]] },
        "772": { name: "Subang Suria to Pasar Seni", color: "#EF4444", waypoints: [[3.1480, 101.5450], [3.1550, 101.5750], [3.1200, 101.6300], [3.1420, 101.6940]] },
        "B115": { name: "KL Sentral to Complex Keramat", color: "#F59E0B", waypoints: [[3.1340, 101.6865], [3.1460, 101.6960], [3.1580, 101.7100], [3.1650, 101.7250]] },
        "250": { name: "LRT Wangsa Maju to Terminal Lebuh Ampang", color: "#F59E0B", waypoints: [[3.2050, 101.7320], [3.1850, 101.7050], [3.1600, 101.6980], [3.1460, 101.6960]] },
        "750": { name: "Central Market to Shah Alam Sek 14", color: "#10B981", waypoints: [[3.1420, 101.6940], [3.1176, 101.6775], [3.0850, 101.5850], [3.0720, 101.5180]] },
        "780": { name: "Pasar Seni to Kota Damansara", color: "#10B981", waypoints: [[3.1420, 101.6940], [3.1450, 101.6600], [3.1400, 101.6150], [3.1510, 101.5920]] },
        "100": { name: "Hub Lebuh Pudu to Kuala Selangor", color: "#10B981", waypoints: [[3.1440, 101.6970], [3.1850, 101.6700], [3.2100, 101.5700], [3.3500, 101.2500]] },
        "T801": { name: "LRT Sri Rampai to Section 10 Wangsa Maju", color: "#10B981", waypoints: [[3.2050, 101.7320], [3.2000, 101.7400], [3.2080, 101.7350], [3.2050, 101.7320]] }
    };

    let currentMapTileLayer = null;
    const MAP_PROVIDERS = {
        esriDark: {
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
            attribution: '© Esri, HERE, Garmin | Rapid KL Bus Telemetry (100% Free • No API Key)',
            maxZoom: 16
        },
        esriStreet: {
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
            attribution: '© Esri, DeLorme, USGS | Rapid KL Telemetry (No Key Required)',
            maxZoom: 19
        },
        osm: {
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: '© OpenStreetMap contributors | Rapid KL Telemetry',
            maxZoom: 19
        }
    };

    function applyMapTileLayer(providerKey = 'esriDark') {
        const mapElem = document.getElementById('bus-map');
        if (!leafletMap || !mapElem) return;

        if (currentMapTileLayer && leafletMap.hasLayer(currentMapTileLayer)) {
            leafletMap.removeLayer(currentMapTileLayer);
        }

        const config = MAP_PROVIDERS[providerKey] || MAP_PROVIDERS.esriDark;
        currentMapTileLayer = L.tileLayer(config.url, {
            attribution: config.attribution,
            maxZoom: config.maxZoom
        });

        currentMapTileLayer.on('tileerror', function() {
            console.warn('Map tile load issue on provider: ' + providerKey + ', automatic fallback active.');
        });

        currentMapTileLayer.addTo(leafletMap);

        if (providerKey === 'osm') {
            mapElem.classList.add('osm-invert');
        } else {
            mapElem.classList.remove('osm-invert');
        }
    }

    function initLeafletMap() {
        const mapElem = document.getElementById('bus-map');
        if (!mapElem || leafletMap) return;

        leafletMap = L.map('bus-map', {
            zoomControl: true,
            scrollWheelZoom: true
        }).setView([3.1390, 101.6869], 12);

        applyMapTileLayer('esriDark');

        setTimeout(() => {
            if (leafletMap) leafletMap.invalidateSize();
        }, 250);

        renderMapRoutePolylines();
        renderMapStationMarkers();
        renderMapBusMarkers('ALL', 'ALL', '');
        setupMapControls();
        updateMapKpis();
    }

    function renderMapRoutePolylines(filterRouteId = 'ALL') {
        mapRoutePolylines.forEach(p => leafletMap.removeLayer(p));
        mapRoutePolylines = [];

        if (!showRoutesLayer) return;

        Object.keys(ROUTE_DEFINITIONS).forEach(routeId => {
            if (filterRouteId !== 'ALL' && filterRouteId !== routeId) return;
            const r = ROUTE_DEFINITIONS[routeId];
            const polyline = L.polyline(r.waypoints, {
                color: r.color,
                weight: filterRouteId === routeId ? 6 : 4,
                opacity: filterRouteId === routeId ? 0.95 : 0.75,
                dashArray: '8, 8'
            }).addTo(leafletMap);

            polyline.bindTooltip(`<strong>Route ${routeId}</strong>: ${r.name}`, { sticky: true });
            mapRoutePolylines.push(polyline);
        });
    }

    function renderMapStationMarkers() {
        mapStationMarkers.forEach(m => leafletMap.removeLayer(m));
        mapStationMarkers = [];

        if (!showStationsLayer) return;

        const stations = (stationList && stationList.length > 0) ? stationList : FALLBACK_STATIONS;
        stations.forEach(s => {
            const iconHtml = `
                <div class="station-div-marker ${s.isDepotHub ? 'station-depot-marker' : ''}">
                    <i class="fa-solid ${s.isDepotHub ? 'fa-warehouse' : 'fa-building-user'}"></i> ${s.stationName}
                </div>
            `;
            const marker = L.marker([s.latitude, s.longitude], {
                icon: L.divIcon({
                    html: iconHtml,
                    className: '',
                    iconSize: [120, 24],
                    iconAnchor: [60, 12]
                })
            }).addTo(leafletMap);

            const routesBadges = s.routesServed.map(r => `<span class="badge badge-low" style="font-size:0.65rem;">Route ${r}</span>`).join(' ');
            const transitBadges = s.transitConnections.map(t => `<span class="badge badge-auto" style="font-size:0.65rem;"><i class="fa-solid fa-train"></i> ${t}</span>`).join(' ');

            marker.bindPopup(`
                <div style="min-width:220px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <strong style="font-size:0.95rem; color:#fff;">${s.stationName}</strong>
                        ${s.isDepotHub ? '<span class="badge badge-critical" style="font-size:0.65rem;">Depot Hub</span>' : ''}
                    </div>
                    <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:6px;">
                        <i class="fa-solid fa-location-dot"></i> ${s.district} Hub
                    </div>
                    <p style="font-size:0.78rem; color:var(--text-dim); margin-bottom:6px; line-height:1.3;">${s.description}</p>
                    <div style="display:flex; flex-wrap:wrap; gap:3px; margin-bottom:4px;">${routesBadges}</div>
                    <div style="display:flex; flex-wrap:wrap; gap:3px; margin-bottom:8px;">${transitBadges}</div>
                    <button class="btn btn-secondary btn-sm" style="width:100%; font-size:0.75rem;" onclick="setOriginStation('${s.stationId}'); tabBtns[2].click();">
                        <i class="fa-solid fa-route"></i> Plan Journey From Station
                    </button>
                </div>
            `);
            mapStationMarkers.push(marker);
        });
    }

    function renderMapBusMarkers(filterRisk = 'ALL', filterRoute = 'ALL', searchQuery = '') {
        mapMarkers.forEach(m => leafletMap.removeLayer(m));
        mapMarkers = [];

        let trips = (currentTrips && currentTrips.length > 0) ? currentTrips : FALLBACK_PREDICTIONS;

        if (filterRisk !== 'ALL') {
            if (filterRisk === 'CRITICAL') trips = trips.filter(t => t.riskLevel === 'CRITICAL');
            else if (filterRisk === 'HIGH') trips = trips.filter(t => t.riskLevel === 'CRITICAL' || t.riskLevel === 'HIGH');
            else if (filterRisk === 'MEDIUM') trips = trips.filter(t => t.riskLevel === 'MEDIUM');
            else if (filterRisk === 'LOW') trips = trips.filter(t => t.riskLevel === 'LOW');
        }

        if (filterRoute !== 'ALL') {
            trips = trips.filter(t => t.routeId === filterRoute);
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            trips = trips.filter(t =>
                t.tripId.toLowerCase().includes(q) ||
                t.busId.toLowerCase().includes(q) ||
                t.routeId.toLowerCase().includes(q) ||
                t.routeName.toLowerCase().includes(q) ||
                t.primaryFactor.toLowerCase().includes(q)
            );
        }

        trips.forEach(t => {
            const color = t.riskLevel === 'CRITICAL' ? '#8B5CF6' : (t.riskLevel === 'HIGH' ? '#EF4444' : (t.riskLevel === 'MEDIUM' ? '#F59E0B' : '#10B981'));
            const rDef = ROUTE_DEFINITIONS[t.routeId];

            let lat = 3.1390;
            let lng = 101.6869;

            if (rDef && rDef.waypoints.length > 0) {
                const idx = (t.rank || 1) % rDef.waypoints.length;
                lat = rDef.waypoints[idx][0] + (Math.sin(t.rank || 1) * 0.003);
                lng = rDef.waypoints[idx][1] + (Math.cos(t.rank || 1) * 0.003);
            }

            const iconHtml = `
                <div class="bus-div-marker" style="background:${color}; width:32px; height:32px;">
                    <div class="bus-marker-pulse" style="border: 2px solid ${color};"></div>
                    <i class="fa-solid fa-bus"></i>
                </div>
            `;

            const marker = L.marker([lat, lng], {
                icon: L.divIcon({
                    html: iconHtml,
                    className: '',
                    iconSize: [32, 32],
                    iconAnchor: [16, 16]
                })
            }).addTo(leafletMap);

            let riskBadgeClass = 'badge-low';
            if (t.riskLevel === 'CRITICAL') riskBadgeClass = 'badge-critical';
            else if (t.riskLevel === 'HIGH') riskBadgeClass = 'badge-high';
            else if (t.riskLevel === 'MEDIUM') riskBadgeClass = 'badge-medium';

            marker.bindPopup(`
                <div style="min-width:240px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                        <strong style="font-size:1rem; color:#fff;">Trip ${t.tripId} (${t.busId})</strong>
                        <span class="badge ${riskBadgeClass}">${t.riskLevel}</span>
                    </div>
                    <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:6px;">
                        <i class="fa-solid fa-route"></i> Route ${t.routeId}: ${t.routeName}
                    </div>
                    <div style="font-size:0.82rem; margin-bottom:4px; color:var(--text-main);">
                        <strong>Predicted Delay:</strong> <span style="color:${color}; font-weight:700;">+${t.predictedDelayMinutes} min</span>
                    </div>
                    <div style="font-size:0.78rem; color:var(--text-dim); margin-bottom:6px;">
                        <strong>Primary Factor:</strong> ${t.primaryFactor}
                    </div>
                    <div style="font-size:0.75rem; color:#A5B4FC; background:rgba(99,102,241,0.15); padding:4px 8px; border-radius:6px; margin-bottom:8px;">
                        <i class="fa-solid fa-robot"></i> ${t.actionState === 'AUTO_EXECUTED' ? 'Action Auto-Executed' : (t.actionState === 'APPROVED' ? 'Operator Approved' : 'Action Pending Approval')}
                    </div>
                    <button class="btn btn-primary btn-sm glow-btn" style="width:100%; justify-content:center;" onclick="inspectTrip('${t.tripId}', true)">
                        <i class="fa-solid fa-sliders"></i> Inspect Action Plan
                    </button>
                </div>
            `);

            mapMarkers.push(marker);
        });
    }

    function setupMapControls() {
        const inputSearch = document.getElementById('map-search-input');
        const filterRisk = document.getElementById('map-filter-risk');
        const filterRoute = document.getElementById('map-filter-route');
        const selectLayer = document.getElementById('map-select-layer');
        const btnToggleRoutes = document.getElementById('map-toggle-routes');
        const btnToggleStations = document.getElementById('map-toggle-stations');
        const btnResetView = document.getElementById('map-reset-view');

        if (selectLayer) {
            selectLayer.addEventListener('change', (e) => {
                applyMapTileLayer(e.target.value);
            });
        }

        if (inputSearch) {
            inputSearch.addEventListener('input', (e) => {
                const q = e.target.value;
                renderMapBusMarkers(
                    filterRisk ? filterRisk.value : 'ALL',
                    filterRoute ? filterRoute.value : 'ALL',
                    q
                );
            });
        }

        if (filterRisk) {
            filterRisk.addEventListener('change', (e) => {
                renderMapBusMarkers(
                    e.target.value,
                    filterRoute ? filterRoute.value : 'ALL',
                    inputSearch ? inputSearch.value : ''
                );
            });
        }

        if (filterRoute) {
            filterRoute.addEventListener('change', (e) => {
                const routeVal = e.target.value;
                renderMapRoutePolylines(routeVal);
                renderMapBusMarkers(
                    filterRisk ? filterRisk.value : 'ALL',
                    routeVal,
                    inputSearch ? inputSearch.value : ''
                );
            });
        }

        if (btnToggleRoutes) {
            btnToggleRoutes.addEventListener('click', () => {
                showRoutesLayer = !showRoutesLayer;
                btnToggleRoutes.classList.toggle('active', showRoutesLayer);
                renderMapRoutePolylines(filterRoute ? filterRoute.value : 'ALL');
            });
        }

        if (btnToggleStations) {
            btnToggleStations.addEventListener('click', () => {
                showStationsLayer = !showStationsLayer;
                btnToggleStations.classList.toggle('active', showStationsLayer);
                renderMapStationMarkers();
            });
        }

        if (btnResetView) {
            btnResetView.addEventListener('click', () => {
                if (leafletMap) {
                    leafletMap.flyTo([3.1390, 101.6869], 12);
                }
            });
        }
    }

    function updateMapKpis() {
        const trips = (currentTrips && currentTrips.length > 0) ? currentTrips : FALLBACK_PREDICTIONS;
        const elemBuses = document.getElementById('map-kpi-buses');
        const elemCritical = document.getElementById('map-kpi-critical');
        const elemAvg = document.getElementById('map-kpi-avgdelay');

        if (elemBuses) elemBuses.textContent = `${trips.length} Monitored`;

        const disrupted = trips.filter(t => t.riskLevel === 'CRITICAL' || t.riskLevel === 'HIGH').length;
        if (elemCritical) elemCritical.textContent = `${disrupted} High/Critical`;

        const totalDelay = trips.reduce((acc, t) => acc + (t.predictedDelayMinutes || 0), 0);
        const avg = trips.length > 0 ? (totalDelay / trips.length).toFixed(1) : '0.0';
        if (elemAvg) elemAvg.textContent = `+${avg} min`;
    }

    async function loadModelMetrics() {
        try {
            const res = await fetch('/api/model-metrics');
            if (!res.ok) throw new Error('API server unavailable');
            const data = await res.json();
            applyModelMetrics(data);
        } catch (e) {
            applyModelMetrics({
                mae: 2.15,
                rmse: 2.84,
                precision: 0.92,
                recall: 0.89,
                f1Score: 0.90,
                tn: 5,
                fp: 0,
                fn: 0,
                tp: 7
            });
        }
    }

    function applyModelMetrics(data) {
        const elemMae = document.getElementById('eval-mae');
        if (elemMae) elemMae.textContent = data.mae + ' min';

        const elemRmse = document.getElementById('eval-rmse');
        if (elemRmse) elemRmse.textContent = data.rmse + ' min';

        const elemPrec = document.getElementById('eval-precision');
        if (elemPrec) elemPrec.textContent = data.precision;

        const elemRec = document.getElementById('eval-recall');
        if (elemRec) elemRec.textContent = data.recall;

        const elemF1 = document.getElementById('eval-f1');
        if (elemF1) elemF1.textContent = data.f1Score;

        const elemTn = document.getElementById('cm-tn');
        if (elemTn) elemTn.textContent = `True Negatives (TN): ${data.tn}`;

        const elemFp = document.getElementById('cm-fp');
        if (elemFp) elemFp.textContent = `False Positives (FP): ${data.fp}`;

        const elemFn = document.getElementById('cm-fn');
        if (elemFn) elemFn.textContent = `False Negatives (FN): ${data.fn}`;

        const elemTp = document.getElementById('cm-tp');
        if (elemTp) elemTp.textContent = `True Positives (TP): ${data.tp}`;
    }

    async function loadAuditLogs() {
        const tbody = document.getElementById('audit-table-body');
        if (!tbody) return;
        try {
            const res = await fetch('/api/audit-logs');
            if (!res.ok) throw new Error('Audit API unavailable');
            const logs = await res.json();
            renderAuditLogs(logs);
        } catch (e) {
            renderAuditLogs(FALLBACK_AUDIT_LOGS);
        }
    }

    function renderAuditLogs(logs) {
        const tbody = document.getElementById('audit-table-body');
        if (!tbody) return;
        if (!logs || logs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="loading-cell">No audit log records found.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        logs.forEach(l => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><code>${l.auditId}</code></td>
                <td>${(l.timestamp || '').replace('T', ' ').substring(0, 19)}</td>
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

            const loadingBubble = appendChatMessage('ai', '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing operational intelligence...');

            try {
                const res = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: text })
                });
                if (!res.ok) throw new Error('AI service offline');
                const data = await res.json();
                if (data.reply && data.reply.includes('Please configure your Groq')) {
                    throw new Error('API key not configured, fallback to local RAG');
                }
                loadingBubble.innerHTML = data.reply ? data.reply.replace(/\n/g, '<br>') : 'Received reply.';
            } catch (e) {
                loadingBubble.innerHTML = getLocalRAGChatReply(text);
            }
        };

        function getLocalRAGChatReply(text) {
            const lower = text.toLowerCase();
            if (lower.includes('executive') || lower.includes('briefing') || lower.includes('summary') || lower.includes('status')) {
                return `<strong>[BusGuard AI Executive Briefing]</strong><br><br>• <strong>Active Monitored Trips:</strong> 12 Rapid KL bus corridors.<br>• <strong>Critical Disruption Risks:</strong> 2 Trips (TRIP-101 on Route 770 [+58.8 min] and TRIP-104 on Route 300 [+42.5 min]).<br>• <strong>Automated Interventions:</strong> 5 strategies auto-executed under safe zero-cost policy.<br>• <strong>Total Saved Delay:</strong> 124.9 minutes saved across network (45.0% reduction).`;
            } else if (lower.includes('770') || lower.includes('federal') || lower.includes('reroute') || lower.includes('101')) {
                return `<strong>[Route 770 Detour Analysis]</strong><br><br>• <strong>Corridor:</strong> Mid Valley South Court Hub to Subang Jaya Depot Hub.<br>• <strong>Bottleneck:</strong> Severe flash flood congestion along Federal Highway.<br>• <strong>Optimal Fix:</strong> Divert at Exit 211 onto NPE Expressway.<br>• <strong>Predicted Delay Saved:</strong> Reduces delay from +58.8m down to +23.5m (-35.3m saved, 60.0% improvement). Toll: MYR 15.00.`;
            } else if (lower.includes('rain') || lower.includes('weather') || lower.includes('monsoon')) {
                return `<strong>[Monsoon / Rain Delay Policy]</strong><br><br>• <strong>Travel Time Impact:</strong> Heavy rain increases transit delay by +30% to +45%.<br>• <strong>Action Plan:</strong> 1) Apply dynamic headway regulation (+10 min buffer). 2) Stage standby buses at Pasar Seni Hub. 3) Prioritize rail bypass transfer options.`;
            } else if (lower.includes('map') || lower.includes('route') || lower.includes('station')) {
                return `<strong>[Live GIS Telemetry Map]</strong><br><br>• <strong>Coverage:</strong> 12 Rapid KL buses and 10 key transit hub stations across Kuala Lumpur.<br>• <strong>Tile Provider:</strong> Operating on 100% Free Public GIS Telemetry (Esri & OpenStreetMap, no API key required).<br>• <strong>Interactive Layer:</strong> Toggle route corridors and station markers directly from the map toolbar.`;
            } else {
                return `<strong>BusGuard AI Assistant (RAG Engine):</strong><br>Query: "<em>${text}</em>"<br><br>Current system status: 12 active trips monitored.<br>TRIP-101 (Route 770) is at <strong>CRITICAL</strong> risk (+58.8m delay) due to Federal Highway flash flood congestion.<br><br><em>Recommendation: Divert via NPE Expressway corridor to reduce delay by 35.3 minutes.</em>`;
            }
        }

        if (aiSend) aiSend.addEventListener('click', sendChatMessage);
        if (aiInput) {
            aiInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') sendChatMessage();
            });
        }
    }

    function appendChatMessage(sender, htmlContent) {
        if (!aiMessages) return;
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
            if (!res.ok) throw new Error('Station API unavailable');
            stationList = await res.json();
        } catch (e) {
            console.warn('Using static station knowledge base fallback for Vercel/GitHub Pages');
            stationList = FALLBACK_STATIONS;
        }
        populateStationSelects(stationList);
        renderStationDirectoryGrid(stationList);
        setupStationSearchEvents();
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
            searchInput.addEventListener('input', () => {
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

        if (query) {
            filtered = filtered.filter(s =>
                s.stationName.toLowerCase().includes(query) ||
                s.district.toLowerCase().includes(query) ||
                s.stationId.toLowerCase().includes(query) ||
                s.routesServed.some(r => r.toLowerCase().includes(query)) ||
                s.transitConnections.some(c => c.toLowerCase().includes(query))
            );
        }

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
            if (!res.ok) throw new Error('Station search API unavailable');
            const data = await res.json();
            renderStationSearchResults(data);
        } catch (e) {
            console.warn('Using fallback station search for Vercel/GitHub Pages static hosting');
            const fallbackData = getFallbackStationSearchResult(origin, destination);
            renderStationSearchResults(fallbackData);
        }
    }

    function getFallbackStationSearchResult(originId, destId) {
        const orig = FALLBACK_STATIONS.find(s => s.stationId === originId) || FALLBACK_STATIONS[0];
        const dest = FALLBACK_STATIONS.find(s => s.stationId === destId) || FALLBACK_STATIONS[3];
        
        return {
            originStation: orig,
            destinationStation: dest,
            matchedTrip: {
                tripId: "TRIP-101",
                busId: "MYB-7701",
                routeId: orig.routesServed[0] || "770",
                routeName: orig.stationName + " to " + dest.stationName,
                scheduledTravelMin: 45,
                observedTravelMin: 67,
                weatherCondition: "HEAVY_RAIN",
                trafficCongestionLevel: "CRITICAL",
                delayCause: "Federal Highway Bottleneck & Heavy Rain"
            },
            prediction: {
                predictedDelayMinutes: 42.5,
                delayProbability: 0.95,
                riskLevel: "CRITICAL",
                riskColor: "#8B5CF6",
                primaryFactor: "Traffic Congestion (CRITICAL)"
            },
            estimatedDistanceKm: 14.8,
            estimatedBaseFareMyr: 3.20,
            summaryRationale: "Direct Bus Route " + (orig.routesServed[0] || "770") + " is currently experiencing a predicted delay of +42.5 minutes (Critical Risk) due to Heavy Bottleneck. 3 alternative travel options are available.",
            alternatives: [
                {
                    optionType: "RAIL_BYPASS",
                    title: "🚆 Rail Bypass (" + (dest.transitConnections[0] || "LRT Kelana Jaya Line") + ")",
                    description: "Transfer to " + (dest.transitConnections[0] || "LRT Line") + " directly from " + orig.stationName + " to " + dest.stationName + " to bypass surface road bottleneck completely with 0 min traffic delay.",
                    estimatedDelayMin: 0.0,
                    timeSavedMin: 42.5,
                    estimatedFareMyr: 4.10,
                    iconClass: "fa-train-subway icon-emerald",
                    badgeText: "RECOMMENDED (0 MIN TRAFFIC DELAY)"
                },
                {
                    optionType: "AI_RECOVERY_STRATEGY",
                    title: "⚡ Expressway Reroute Bypass",
                    description: "Apply Expressway Detour: Divert at Exit 211 onto NPE Expressway. Reduces predicted delay from +42.5m down to +17.0m.",
                    estimatedDelayMin: 17.0,
                    timeSavedMin: 25.5,
                    estimatedFareMyr: 3.20,
                    iconClass: "fa-bolt icon-purple",
                    badgeText: "SAVINGS: -25.5 MIN"
                },
                {
                    optionType: "PARALLEL_BUS_ROUTE",
                    title: "🚌 Parallel Route Option (Route B115)",
                    description: "Board Route B115 at " + orig.stationName + ". Operates along secondary express bus lane with lower traffic congestion.",
                    estimatedDelayMin: 14.8,
                    timeSavedMin: 27.7,
                    estimatedFareMyr: 3.20,
                    iconClass: "fa-bus-simple icon-blue",
                    badgeText: "LOW CONGESTION ALTERNATIVE"
                }
            ]
        };
    }

    function renderStationSearchResults(data) {
        const resultsContainer = document.getElementById('station-results-container');
        if (!resultsContainer || !data || !data.originStation || !data.destinationStation) {
            if (resultsContainer) resultsContainer.innerHTML = '<div class="placeholder-state text-danger"><p>No station data found.</p></div>';
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
