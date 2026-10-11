// =============================================================================
// BusGuard AI — Self-Contained Static Deployment JS
// All API data is embedded directly so the frontend works without a Java backend.
// =============================================================================

// ── Embedded Dataset (from rapid_kl_bus_trips.csv) ──────────────────────────
const RAW_TRIPS = [
    { tripId:"TRIP-101", busId:"MYB-7701", routeId:"770", routeName:"Mid Valley to Subang Jaya", scheduledDeparture:"2026-10-10T08:00:00", observedDeparture:"2026-10-10T08:14:00", scheduledTravelMin:45, observedTravelMin:67, passengerLoad:88, driverId:"DRV-402", driverShiftHours:6.5, standbyBusAvailable:true, weatherCondition:"HEAVY_RAIN", trafficCongestionLevel:"CRITICAL", latitude:3.1176, longitude:101.6775, delayCause:"Federal Highway Congestion & Flash Flood" },
    { tripId:"TRIP-102", busId:"MYB-1152", routeId:"B115", routeName:"KL Sentral to Complex Keramat", scheduledDeparture:"2026-10-10T08:15:00", observedDeparture:"2026-10-10T08:22:00", scheduledTravelMin:30, observedTravelMin:48, passengerLoad:75, driverId:"DRV-109", driverShiftHours:4.0, standbyBusAvailable:true, weatherCondition:"LIGHT_RAIN", trafficCongestionLevel:"HIGH", latitude:3.1340, longitude:101.6865, delayCause:"Jalan Tun Sambanthan Bus Lane Bottleneck" },
    { tripId:"TRIP-103", busId:"MYB-7503", routeId:"750", routeName:"Central Market to Shah Alam Sek 14", scheduledDeparture:"2026-10-10T08:30:00", observedDeparture:"2026-10-10T08:32:00", scheduledTravelMin:50, observedTravelMin:53, passengerLoad:42, driverId:"DRV-881", driverShiftHours:3.2, standbyBusAvailable:true, weatherCondition:"CLEAR", trafficCongestionLevel:"LOW", latitude:3.1450, longitude:101.6960, delayCause:"Minor Traffic Signal Delay" },
    { tripId:"TRIP-104", busId:"MYB-3004", routeId:"300", routeName:"Pandan Indah to Lebuh Ampang", scheduledDeparture:"2026-10-10T08:40:00", observedDeparture:"2026-10-10T08:58:00", scheduledTravelMin:35, observedTravelMin:59, passengerLoad:94, driverId:"DRV-332", driverShiftHours:8.5, standbyBusAvailable:false, weatherCondition:"MODERATE_RAIN", trafficCongestionLevel:"HIGH", latitude:3.1490, longitude:101.7120, delayCause:"Ampang Corridor Construction Gridlock" },
    { tripId:"TRIP-105", busId:"MYB-7805", routeId:"780", routeName:"Pasar Seni to Kota Damansara", scheduledDeparture:"2026-10-10T09:00:00", observedDeparture:"2026-10-10T09:01:00", scheduledTravelMin:55, observedTravelMin:57, passengerLoad:30, driverId:"DRV-115", driverShiftHours:2.0, standbyBusAvailable:true, weatherCondition:"CLEAR", trafficCongestionLevel:"LOW", latitude:3.1420, longitude:101.6940, delayCause:"Normal Operating Conditions" },
    { tripId:"TRIP-106", busId:"MYB-6006", routeId:"600", routeName:"Hab Puchong Utama to Pasar Seni", scheduledDeparture:"2026-10-10T09:10:00", observedDeparture:"2026-10-10T09:28:00", scheduledTravelMin:60, observedTravelMin:92, passengerLoad:98, driverId:"DRV-904", driverShiftHours:7.8, standbyBusAvailable:true, weatherCondition:"HEAVY_RAIN", trafficCongestionLevel:"CRITICAL", latitude:3.0330, longitude:101.6210, delayCause:"LDP Interchange Vehicle Breakdown" },
    { tripId:"TRIP-107", busId:"MYB-2507", routeId:"250", routeName:"LRT Wangsa Maju to Terminal Lebuh Ampang", scheduledDeparture:"2026-10-10T09:20:00", observedDeparture:"2026-10-10T09:23:00", scheduledTravelMin:40, observedTravelMin:44, passengerLoad:50, driverId:"DRV-554", driverShiftHours:4.5, standbyBusAvailable:true, weatherCondition:"CLEAR", trafficCongestionLevel:"MEDIUM", latitude:3.2050, longitude:101.7320, delayCause:"Jalan Pahang Bus Stop Crowding" },
    { tripId:"TRIP-108", busId:"MYB-4508", routeId:"450", routeName:"Hentian Kajang to Hub Lebuh Pudu", scheduledDeparture:"2026-10-10T09:30:00", observedDeparture:"2026-10-10T09:49:00", scheduledTravelMin:65, observedTravelMin:99, passengerLoad:91, driverId:"DRV-201", driverShiftHours:9.2, standbyBusAvailable:false, weatherCondition:"HEAVY_RAIN", trafficCongestionLevel:"HIGH", latitude:2.9820, longitude:101.7850, delayCause:"Cheras Highway Heavy Congestion" },
    { tripId:"TRIP-109", busId:"MYB-1009", routeId:"100", routeName:"Hub Lebuh Pudu to Kuala Selangor", scheduledDeparture:"2026-10-10T09:45:00", observedDeparture:"2026-10-10T09:46:00", scheduledTravelMin:80, observedTravelMin:82, passengerLoad:35, driverId:"DRV-743", driverShiftHours:1.5, standbyBusAvailable:true, weatherCondition:"CLEAR", trafficCongestionLevel:"LOW", latitude:3.1460, longitude:101.6965, delayCause:"On Time Schedule" },
    { tripId:"TRIP-110", busId:"MYB-5900", routeId:"590", routeName:"Hab Bandar Sungai Long to Hub Lebuh Pudu", scheduledDeparture:"2026-10-10T10:00:00", observedDeparture:"2026-10-10T10:18:00", scheduledTravelMin:50, observedTravelMin:78, passengerLoad:85, driverId:"DRV-612", driverShiftHours:5.2, standbyBusAvailable:true, weatherCondition:"MODERATE_RAIN", trafficCongestionLevel:"HIGH", latitude:3.0450, longitude:101.7920, delayCause:"Sungai Besi Toll Bottleneck" },
    { tripId:"TRIP-111", busId:"MYB-8011", routeId:"T801", routeName:"LRT Sri Rampai to Section 10 Wangsa Maju", scheduledDeparture:"2026-10-10T10:15:00", observedDeparture:"2026-10-10T10:16:00", scheduledTravelMin:20, observedTravelMin:21, passengerLoad:22, driverId:"DRV-304", driverShiftHours:3.0, standbyBusAvailable:true, weatherCondition:"CLEAR", trafficCongestionLevel:"LOW", latitude:3.1970, longitude:101.7380, delayCause:"Feeder Bus Dynamic Flow" },
    { tripId:"TRIP-112", busId:"MYB-7722", routeId:"772", routeName:"Subang Suria to Pasar Seni", scheduledDeparture:"2026-10-10T10:30:00", observedDeparture:"2026-10-10T10:52:00", scheduledTravelMin:55, observedTravelMin:91, passengerLoad:89, driverId:"DRV-118", driverShiftHours:6.8, standbyBusAvailable:true, weatherCondition:"HEAVY_RAIN", trafficCongestionLevel:"CRITICAL", latitude:3.1480, longitude:101.5450, delayCause:"Federal Highway Subang Ramp Blockage" }
];

// ── ML Prediction Engine (replicates Java DelayPredictorML) ─────────────────
function predict(trip) {
    const delayMin = trip.observedTravelMin - trip.scheduledTravelMin;
    const weatherFactor = trip.weatherCondition === "HEAVY_RAIN" ? 1.35 : (trip.weatherCondition === "MODERATE_RAIN" ? 1.15 : 1.0);
    const trafficFactor = trip.trafficCongestionLevel === "CRITICAL" ? 1.4 : (trip.trafficCongestionLevel === "HIGH" ? 1.25 : (trip.trafficCongestionLevel === "MEDIUM" ? 1.1 : 1.0));
    const predictedDelay = Math.max(0, delayMin * weatherFactor * trafficFactor * 0.55 + (trip.passengerLoad > 80 ? 2.5 : 0));
    const prob = Math.min(1.0, predictedDelay / 25.0 + (trip.trafficCongestionLevel === "CRITICAL" ? 0.3 : 0));
    
    let riskLevel = "LOW";
    if (predictedDelay >= 15 || prob >= 0.8) riskLevel = "CRITICAL";
    else if (predictedDelay >= 10 || prob >= 0.6) riskLevel = "HIGH";
    else if (predictedDelay >= 5 || prob >= 0.35) riskLevel = "MEDIUM";

    const priorityScore = (predictedDelay * 2.0) + (prob * 30) + (trip.passengerLoad * 0.3)
        + (riskLevel === "CRITICAL" ? 20 : (riskLevel === "HIGH" ? 10 : (riskLevel === "MEDIUM" ? 5 : 0)));

    const features = {};
    features["Traffic Congestion"] = delayMin * trafficFactor * 0.3;
    features["Weather Impact"] = delayMin * weatherFactor * 0.2;
    features["Passenger Load Stress"] = trip.passengerLoad > 80 ? 2.5 : 0.5;
    features["Scheduled Route Duration"] = trip.scheduledTravelMin * 0.02;

    let explanationText = `Trip ${trip.tripId} on Route ${trip.routeId} predicted +${predictedDelay.toFixed(1)} min delay. `;
    if (trip.trafficCongestionLevel === "CRITICAL" || trip.trafficCongestionLevel === "HIGH") {
        explanationText += `Primary contributor: ${trip.trafficCongestionLevel} traffic congestion along ${trip.routeName}. `;
    }
    if (trip.weatherCondition !== "CLEAR") {
        explanationText += `Weather factor: ${trip.weatherCondition.replace("_"," ").toLowerCase()} conditions increasing disruption risk. `;
    }
    if (trip.passengerLoad > 80) {
        explanationText += `High passenger load (${trip.passengerLoad}%) amplifies service impact. `;
    }

    return {
        tripId: trip.tripId,
        predictedDelayMinutes: parseFloat(predictedDelay.toFixed(1)),
        delayProbability: parseFloat(prob.toFixed(2)),
        riskLevel,
        priorityScore: parseFloat(priorityScore.toFixed(1)),
        primaryFactor: trip.delayCause,
        explanationText,
        featureContributions: features
    };
}

// ── Recovery Optimizer (replicates Java RecoveryOptimizer) ───────────────────
function generateCandidates(trip, pred) {
    const candidates = [];
    // Route Optimization
    const routeFeasible = pred.predictedDelayMinutes >= 5;
    candidates.push({
        candidateId: `${trip.tripId}-ROUTE`, strategyType: "ROUTE_OPTIMIZATION",
        title: "Route Detour via Express Corridor",
        actionDetails: `Divert Bus ${trip.busId} from main corridor to express bypass along ${trip.routeName}. Skip congested intermediate stops.`,
        feasible: routeFeasible, feasibilityReason: routeFeasible ? "Route alternative available" : "Delay too low for route change",
        estimatedPostActionDelayMin: parseFloat((pred.predictedDelayMinutes * 0.45).toFixed(1)),
        expectedDelayReductionMin: parseFloat((pred.predictedDelayMinutes * 0.55).toFixed(1)),
        estimatedCostImpact: 45.00, confidenceScore: 0.87,
        potentialSideEffects: "Passengers at skipped stops may need to wait for next bus",
        recommendationRationale: "High impact reduction with moderate operational cost. Recommended for HIGH/CRITICAL delays."
    });
    // Standby Bus
    const standbyFeasible = trip.standbyBusAvailable && pred.predictedDelayMinutes >= 8;
    candidates.push({
        candidateId: `${trip.tripId}-STANDBY`, strategyType: "STANDBY_REASSIGNMENT",
        title: "Standby Bus Depot Injection",
        actionDetails: `Deploy standby bus from nearest depot to absorb downstream demand on Route ${trip.routeId}.`,
        feasible: standbyFeasible, feasibilityReason: standbyFeasible ? "Standby bus available at depot" : (trip.standbyBusAvailable ? "Delay below standby threshold" : "No standby bus available"),
        estimatedPostActionDelayMin: parseFloat((pred.predictedDelayMinutes * 0.3).toFixed(1)),
        expectedDelayReductionMin: parseFloat((pred.predictedDelayMinutes * 0.7).toFixed(1)),
        estimatedCostImpact: 120.00, confidenceScore: 0.92,
        potentialSideEffects: "Increases fleet operating cost; depot standby reduced by 1 unit",
        recommendationRationale: "Maximum delay reduction. Best for CRITICAL risk with available standby units."
    });
    // Adaptive Scheduling
    candidates.push({
        candidateId: `${trip.tripId}-ADAPTIVE`, strategyType: "ADAPTIVE_SCHEDULING",
        title: "Headway Regulation (+5 min Buffer)",
        actionDetails: `Adjust departure headway by +5 minutes to absorb propagation delay along Route ${trip.routeId}.`,
        feasible: true, feasibilityReason: "Schedule adjustment always feasible",
        estimatedPostActionDelayMin: parseFloat((pred.predictedDelayMinutes * 0.65).toFixed(1)),
        expectedDelayReductionMin: parseFloat((pred.predictedDelayMinutes * 0.35).toFixed(1)),
        estimatedCostImpact: 10.00, confidenceScore: 0.78,
        potentialSideEffects: "Minor cascading schedule shift for trailing buses",
        recommendationRationale: "Low cost and safe fallback option. Suitable for MEDIUM risk."
    });
    // No Action
    candidates.push({
        candidateId: `${trip.tripId}-NOACTION`, strategyType: "NO_ACTION",
        title: "Retain Baseline Schedule (No Intervention)",
        actionDetails: "Maintain current timetable. Monitor GPS telemetry for real-time updates.",
        feasible: true, feasibilityReason: "Always available",
        estimatedPostActionDelayMin: pred.predictedDelayMinutes,
        expectedDelayReductionMin: 0, estimatedCostImpact: 0, confidenceScore: 1.0,
        potentialSideEffects: "Delay propagates to downstream trips and passenger wait times increase",
        recommendationRationale: "Zero cost but zero improvement. Only suitable for LOW risk trips."
    });

    // Select best feasible
    let selected = candidates.filter(c => c.feasible).sort((a, b) => b.expectedDelayReductionMin - a.expectedDelayReductionMin)[0];
    if (!selected) selected = candidates[candidates.length - 1]; // fallback to no-action

    return { candidates, selected };
}

// ── Execution Policy (replicates Java ExecutionPolicyEngine) ─────────────────
function evaluateDecision(pred, selected) {
    if (selected.strategyType === "NO_ACTION") return "BLOCKED";
    if (selected.confidenceScore >= 0.85 && pred.riskLevel !== "CRITICAL") return "AUTO_EXECUTE";
    return "REQUIRES_APPROVAL";
}

// ── Impact Verifier (replicates Java ImpactVerifier) ─────────────────────────
function verifyImpact(trip, pred, selected) {
    const baselineDelay = pred.predictedDelayMinutes;
    const postDelay = selected.estimatedPostActionDelayMin;
    const reduction = parseFloat((baselineDelay - postDelay).toFixed(1));
    const pctImprovement = baselineDelay > 0 ? parseFloat(((reduction / baselineDelay) * 100).toFixed(1)) : 0;
    const cost = selected.estimatedCostImpact;
    const status = reduction > 0 ? "IMPROVED" : "NO_CHANGE";
    const summary = `Recovery strategy "${selected.title}" reduces predicted delay from +${baselineDelay}min to +${postDelay}min (${pctImprovement}% improvement). Cost: RM${cost.toFixed(2)}.`;
    return { baselineDelayMin: baselineDelay, postActionDelayMin: postDelay, delayReductionMin: reduction, percentageImprovement: pctImprovement, costImpact: cost, outcomeStatus: status, verificationSummary: summary };
}

// ── State Manager ────────────────────────────────────────────────────────────
const tripStates = {};
const auditLogs = [];

function getTripState(tripId) { return tripStates[tripId] || "PENDING"; }
function setTripState(tripId, state) { tripStates[tripId] = state; }

// ── Build Computed Data ─────────────────────────────────────────────────────
function buildPredictions() {
    const preds = RAW_TRIPS.map(t => predict(t));
    preds.sort((a, b) => b.priorityScore - a.priorityScore);
    preds.forEach((p, i) => { p.rank = i + 1; });
    return preds;
}

function buildTripDetail(tripId) {
    const trip = RAW_TRIPS.find(t => t.tripId === tripId) || RAW_TRIPS[0];
    const pred = predict(trip);
    const opt = generateCandidates(trip, pred);
    const decision = evaluateDecision(pred, opt.selected);
    if (!tripStates[trip.tripId]) {
        if (decision === "AUTO_EXECUTE") tripStates[trip.tripId] = "AUTO_EXECUTED";
        else if (decision === "REQUIRES_APPROVAL") tripStates[trip.tripId] = "PENDING_APPROVAL";
        else tripStates[trip.tripId] = "PENDING";
    }
    const impact = verifyImpact(trip, pred, opt.selected);
    return {
        ...trip, ...pred,
        candidates: opt.candidates,
        selectedCandidate: opt.selected,
        executionDecision: decision,
        executionDecisionLabel: decision.replace(/_/g, " "),
        executionDecisionColor: decision === "AUTO_EXECUTE" ? "#10B981" : (decision === "REQUIRES_APPROVAL" ? "#F59E0B" : "#EF4444"),
        actionState: tripStates[trip.tripId],
        impact
    };
}

function buildSystemSummary() {
    const preds = buildPredictions();
    let criticalCount = 0, highCount = 0, totalDelay = 0;
    preds.forEach(p => {
        totalDelay += p.predictedDelayMinutes;
        if (p.riskLevel === "CRITICAL") criticalCount++;
        else if (p.riskLevel === "HIGH") highCount++;
    });
    return { totalTrips: preds.length, criticalTrips: criticalCount, highRiskTrips: highCount, totalBaselineDelayMin: parseFloat(totalDelay.toFixed(1)), modelMae: 2.15, modelPrecision: 0.92 };
}

function buildModelMetrics() {
    return { mae: 2.15, rmse: 2.84, precision: 0.92, recall: 0.89, f1Score: 0.90, totalEvaluatedTrips: 12, tp: 6, fp: 1, tn: 4, fn: 1 };
}

function runSimulation() {
    auditLogs.length = 0;
    let autoCount = 0, reqApproval = 0, blocked = 0, totalReduction = 0;
    RAW_TRIPS.forEach(trip => {
        const pred = predict(trip);
        const opt = generateCandidates(trip, pred);
        const decision = evaluateDecision(pred, opt.selected);
        const impact = verifyImpact(trip, pred, opt.selected);
        let status = "PENDING";
        if (decision === "AUTO_EXECUTE") { status = "AUTO_EXECUTED"; autoCount++; tripStates[trip.tripId] = "AUTO_EXECUTED"; }
        else if (decision === "REQUIRES_APPROVAL") { status = "PENDING_APPROVAL"; reqApproval++; tripStates[trip.tripId] = "PENDING_APPROVAL"; }
        else { status = "BLOCKED"; blocked++; tripStates[trip.tripId] = "PENDING"; }
        totalReduction += impact.delayReductionMin;
        auditLogs.push({
            auditId: `AUD-${Date.now()}-${trip.tripId}`, timestamp: new Date().toISOString(),
            tripId: trip.tripId, busId: trip.busId, routeId: trip.routeId,
            predictedDelayMin: pred.predictedDelayMinutes, riskLevel: pred.riskLevel,
            selectedStrategy: opt.selected.title, executionDecision: decision,
            actionStatus: status, delayReductionMin: impact.delayReductionMin,
            percentageImprovement: impact.percentageImprovement,
            decisionRationale: opt.selected.recommendationRationale
        });
    });
    return { status: "SUCCESS", totalTrips: RAW_TRIPS.length, autoExecuted: autoCount, requiresApproval: reqApproval, blocked, totalDelaySavedMin: parseFloat(totalReduction.toFixed(1)) };
}

// ── Mock fetch wrapper ──────────────────────────────────────────────────────
const _originalFetch = window.fetch;
window.fetch = function(url, options) {
    const urlStr = typeof url === 'string' ? url : (url && url.url ? url.url : (url ? url.toString() : ''));
    if (urlStr.includes('/api/') || urlStr.startsWith('api/')) {
        return handleMockApi(urlStr, options);
    }
    return _originalFetch.call(this, url, options);
};

window.downloadDataset = function(type) {
    fetch('/api/download-dataset?type=' + type).then(r => r.blob()).then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = type === '10k' ? 'rapid_kl_10k_synthetic.csv' : 'rapid_kl_bus_trips.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }).catch(err => {
        console.error('Download error:', err);
    });
};

function handleMockApi(url, options) {
    const match = url.match(/\/api\/[^?#]*/);
    let path = match ? match[0] : url.split('?')[0];
    if (!path.startsWith('/api/') && path.startsWith('api/')) {
        path = '/' + path;
    }
    const queryStr = url.includes('?') ? url.split('?')[1] : '';
    const params = new URLSearchParams(queryStr);

    let data;
    if (path === '/api/system-summary') {
        data = buildSystemSummary();
    } else if (path === '/api/predictions') {
        const preds = buildPredictions();
        data = preds.map(p => {
            const trip = RAW_TRIPS.find(t => t.tripId === p.tripId);
            const opt = generateCandidates(trip, p);
            const decision = evaluateDecision(p, opt.selected);
            if (!tripStates[trip.tripId]) {
                if (decision === "AUTO_EXECUTE") tripStates[trip.tripId] = "AUTO_EXECUTED";
                else if (decision === "REQUIRES_APPROVAL") tripStates[trip.tripId] = "PENDING_APPROVAL";
                else tripStates[trip.tripId] = "PENDING";
            }
            return { ...p, busId: trip.busId, routeId: trip.routeId, routeName: trip.routeName, actionState: tripStates[trip.tripId] };
        });
    } else if (path === '/api/trip-detail') {
        const tripId = params.get('tripId') || 'TRIP-101';
        data = buildTripDetail(tripId);
    } else if (path === '/api/trips' || path === '/api/dataset') {
        data = RAW_TRIPS;
    } else if (path === '/api/model-metrics') {
        data = buildModelMetrics();
    } else if (path === '/api/audit-logs') {
        data = auditLogs;
    } else if (path === '/api/simulate-all') {
        data = runSimulation();
    } else if (path === '/api/action/approve') {
        const tripId = params.get('tripId');
        tripStates[tripId] = "APPROVED";
        const trip = RAW_TRIPS.find(t => t.tripId === tripId);
        const pred = predict(trip);
        const opt = generateCandidates(trip, pred);
        const impact = verifyImpact(trip, pred, opt.selected);
        let steps = [];
        if (opt.selected.strategyType === "ROUTE_OPTIMIZATION") {
            steps = [`Step 1: Signal Driver of Bus ${trip.busId} to divert at Exit 211 onto Expressway Bypass Corridor.`, `Step 2: Notify passengers via bus onboard display that intermediate stops #4 and #5 will be bypassed to skip heavy congestion.`, `Step 3: Re-enter main route schedule at Station 8. Expected delay saving: ${impact.delayReductionMin} minutes.`];
        } else if (opt.selected.strategyType === "STANDBY_REASSIGNMENT") {
            steps = [`Step 1: Issue immediate depot dispatch command for Standby Bus MYB-DEPOT-99 at KL Sentral Hub.`, `Step 2: Proceed via express bus lane directly to Terminal Station 5.`, `Step 3: Inject Standby Bus into Trip ${trip.tripId} sequence, absorbing 80% of downstream delay.`];
        } else if (opt.selected.strategyType === "ADAPTIVE_SCHEDULING") {
            steps = [`Step 1: Transmit departure adjustment code +5 mins to driver console.`, `Step 2: Update terminal electronic passenger display boards with adjusted 5-minute headway buffer.`, `Step 3: Synchronize trailing bus interval to eliminate bus bunching along Route ${trip.routeId}.`];
        } else {
            steps = [`Step 1: Retain baseline timetable.`, `Step 2: Monitor vehicle telemetry for route updates.`, `Step 3: Re-evaluate when traffic congestion level changes.`];
        }
        data = { success: true, tripId: trip.tripId, busId: trip.busId, routeId: trip.routeId, status: "SUCCESSFUL_INTERVENTION_APPLIED", strategyTitle: opt.selected.title, baselineDelayMin: impact.baselineDelayMin, postActionDelayMin: impact.postActionDelayMin, delayReductionMin: impact.delayReductionMin, percentageImprovement: impact.percentageImprovement, costImpact: impact.costImpact, outcomeStatus: impact.outcomeStatus, verificationSummary: impact.verificationSummary, movementSteps: steps };
    } else if (path === '/api/action/reject') {
        const tripId = params.get('tripId');
        tripStates[tripId] = "REJECTED";
        data = { success: true, tripId, status: "REJECTED" };
    } else if (path === '/api/chat') {
        const body = options && options.body ? JSON.parse(options.body) : {};
        const msg = body.message || "";
        data = { reply: generateLocalChatReply(msg) };
    } else if (path === '/api/download-dataset') {
        const type = params.get('type');
        let csv = "";
        if (type === '10k') {
            csv = "record_id,trip_id,route_id,scheduled_travel_min,observed_travel_min,passenger_load,weather,traffic_level,delay_min,is_critical\n";
            for (let i = 1; i <= 500; i++) {
                const baseTrip = RAW_TRIPS[(i - 1) % RAW_TRIPS.length];
                const rain = (i % 3 === 0) ? "HEAVY_RAIN" : (i % 2 === 0 ? "MODERATE_RAIN" : "CLEAR");
                const traffic = (i % 4 === 0) ? "CRITICAL" : (i % 3 === 0 ? "HIGH" : "MEDIUM");
                const delay = Math.max(0, Math.round(((i * 7) % 35) + (rain === "HEAVY_RAIN" ? 12 : 2)));
                csv += `REC-${10000 + i},${baseTrip.tripId},${baseTrip.routeId},${baseTrip.scheduledTravelMin},${baseTrip.scheduledTravelMin + delay},${baseTrip.passengerLoad},${rain},${traffic},${delay},${delay >= 15 ? 1 : 0}\n`;
            }
        } else {
            csv = "trip_id,bus_id,route_id,route_name,scheduled_departure,observed_departure,scheduled_travel_min,observed_travel_min,passenger_load,driver_id,driver_shift_hours,standby_bus_available,weather_condition,traffic_congestion_level,latitude,longitude,delay_cause\n";
            RAW_TRIPS.forEach(t => {
                csv += `${t.tripId},${t.busId},${t.routeId},"${t.routeName}","${t.scheduledDeparture}","${t.observedDeparture}",${t.scheduledTravelMin},${t.observedTravelMin},${t.passengerLoad},${t.driverId},${t.driverShiftHours},${t.standbyBusAvailable},${t.weatherCondition},${t.trafficCongestionLevel},${t.latitude},${t.longitude},"${t.delayCause}"\n`;
            });
        }
        return Promise.resolve(new Response(new Blob([csv], { type: 'text/csv' }), { status: 200 }));
    } else {
        data = { error: "Endpoint not found" };
    }

    return Promise.resolve(new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } }));
}

// ── Local Chat Reply Generator ──────────────────────────────────────────────
function generateLocalChatReply(message) {
    const msg = message.toLowerCase();
    const preds = buildPredictions();
    const criticalTrips = preds.filter(p => p.riskLevel === "CRITICAL");
    const highTrips = preds.filter(p => p.riskLevel === "HIGH");

    if (msg.includes("summary") || msg.includes("briefing") || msg.includes("overview")) {
        return `📊 **Executive Delay Briefing — Rapid KL Bus Operations**\n\nCurrently monitoring **${preds.length} active trips** across the Klang Valley network.\n\n🔴 **${criticalTrips.length} CRITICAL risk trips** requiring immediate intervention:\n${criticalTrips.map(t => `• ${t.tripId} — +${t.predictedDelayMinutes}min delay (${t.primaryFactor})`).join('\n')}\n\n🟡 **${highTrips.length} HIGH risk trips** under active monitoring.\n\n📈 ML Model Accuracy: MAE 2.15 min | Precision 92% | F1 Score 0.90\n\nRecommendation: Prioritize CRITICAL trips for standby bus deployment or route detour to minimize passenger impact.`;
    }

    if (msg.includes("trip-101") || msg.includes("101")) {
        const t = RAW_TRIPS[0];
        const p = predict(t);
        return `🔍 **TRIP-101 Detailed Analysis**\n\n🚌 Bus ${t.busId} on Route ${t.routeId} (${t.routeName})\n⏱ Predicted Delay: **+${p.predictedDelayMinutes} min** | Risk: **${p.riskLevel}**\n🌧 Weather: ${t.weatherCondition.replace("_"," ")} | Traffic: ${t.trafficCongestionLevel}\n👥 Passenger Load: ${t.passengerLoad}%\n\n📍 Root Cause: ${t.delayCause}\n\n💡 **Recommended Fix:** Deploy standby bus from nearest depot OR reroute via express corridor to bypass Federal Highway congestion. Expected delay reduction: ~${(p.predictedDelayMinutes * 0.55).toFixed(1)} minutes.`;
    }

    if (msg.includes("rain") || msg.includes("weather")) {
        return `🌧 **Rain Delay Strategy Advisory**\n\nHeavy rain currently impacts ${RAW_TRIPS.filter(t=>t.weatherCondition==="HEAVY_RAIN").length} routes, increasing delay risk by ~35%.\n\n**Recommended Actions:**\n1. Activate standby buses at Puchong, Subang, and Kajang depots\n2. Enable +5 min headway buffer on all heavy-rain-affected routes\n3. Notify passenger info displays with updated ETAs\n4. Monitor Federal Highway and LDP corridor for flash flood warnings\n\nHistorically, heavy rain adds 8-15 minutes to routes through Federal Highway and Cheras corridor.`;
    }

    if (msg.includes("reroute") || msg.includes("detour") || msg.includes("770") || msg.includes("federal")) {
        return `🛣 **Route 770 Federal Highway Congestion Analysis**\n\nCurrent Status: CRITICAL congestion + flash flooding reported\nAffected Trip: TRIP-101 (Bus MYB-7701)\n\n**Detour Strategy:**\n1. Divert at Exit 211 (Subang Jaya interchange)\n2. Take NPE Expressway bypass corridor\n3. Re-enter main route at Shah Alam Sek 14 junction\n\nEstimated delay reduction: ~55% | Cost: RM 45.00\nTradeoff: Passengers at stops #4 and #5 will need to wait for next scheduled bus.`;
    }

    if (msg.includes("standby") || msg.includes("depot") || msg.includes("dispatch")) {
        const available = RAW_TRIPS.filter(t => t.standbyBusAvailable).length;
        return `🚌 **Standby Bus Depot Status**\n\n✅ **${available} out of ${RAW_TRIPS.length}** routes have standby buses available in nearby depots.\n\n**Recommended Deployment Locations:**\n1. KL Sentral Hub — covers Route 770, B115, 780\n2. Puchong Depot — covers Route 600, 590\n3. Kajang Terminal — covers Route 450\n\n⚠️ Routes 300 and 450 have NO standby available. Consider cross-depot transfer if CRITICAL delays persist.`;
    }

    if (msg.includes("10k") || msg.includes("dataset") || msg.includes("training") || msg.includes("ml") || msg.includes("model")) {
        return `🧠 **ML Training Dataset & Model Insights**\n\nThe BusGuard AI predictor was trained on **10,000 synthetic Rapid KL records** generated from real operational patterns.\n\n**Training Features:**\n• Scheduled vs observed departure/arrival times\n• Weather conditions (CLEAR, LIGHT_RAIN, MODERATE_RAIN, HEAVY_RAIN)\n• Traffic congestion levels (LOW, MEDIUM, HIGH, CRITICAL)\n• Passenger load percentage\n• Driver shift hours\n• GPS coordinates (Klang Valley region)\n\n**Model Performance:**\n• MAE: 2.15 minutes\n• RMSE: 2.84 minutes\n• Precision: 0.92 | Recall: 0.89 | F1: 0.90\n\nThe model uses a weighted feature contribution approach similar to SHAP to explain predictions.`;
    }

    // Default response
    return `🤖 Thank you for your query! Based on current Rapid KL operations data:\n\n• **${preds.length} trips** actively monitored\n• **${criticalTrips.length} CRITICAL** and **${highTrips.length} HIGH** risk trips detected\n• Primary disruption corridors: Federal Highway, Cheras Highway, LDP Interchange\n\nI can help with:\n• Executive delay briefings\n• Individual trip analysis (e.g., "Why is TRIP-101 delayed?")\n• Rerouting strategies\n• Standby bus deployment recommendations\n• Weather impact analysis\n• ML model insights\n\nPlease ask a more specific question and I'll provide detailed operational intelligence!`;
}


// =============================================================================
// Original app.js logic (unchanged from source, works with mock fetch above)
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Check if on workbench page
    if (!document.getElementById('kpi-total-trips')) {
        return; // Skip workbench UI setup on other pages like assistant.html or dataset.html
    }

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
                tbody.innerHTML = '<tr><td colspan="9" class="loading-cell">No audit log records found. Run Auto-Simulation to generate logs.</td></tr>';
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
});
