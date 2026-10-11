package com.busguard.station;

import com.busguard.ml.DelayPredictorML;
import com.busguard.model.BusTrip;
import com.busguard.model.PredictionResult;
import com.busguard.recovery.RecoveryOptimizer;

import java.util.*;
import java.util.stream.Collectors;

public class StationSearchEngine {

    private final StationKnowledgeBase stationKb;
    private final DelayPredictorML predictor;
    private final RecoveryOptimizer optimizer;

    public StationSearchEngine(StationKnowledgeBase stationKb, DelayPredictorML predictor) {
        this.stationKb = stationKb;
        this.predictor = predictor;
        this.optimizer = new RecoveryOptimizer();
    }

    public static class AlternativeOption {
        private String optionType; // RAIL_BYPASS, AI_RECOVERY_STRATEGY, PARALLEL_BUS_ROUTE
        private String title;
        private String description;
        private double estimatedDelayMin;
        private double timeSavedMin;
        private double estimatedFareMyr;
        private String iconClass;
        private String badgeText;

        public AlternativeOption(String optionType, String title, String description, double estimatedDelayMin, double timeSavedMin, double estimatedFareMyr, String iconClass, String badgeText) {
            this.optionType = optionType;
            this.title = title;
            this.description = description;
            this.estimatedDelayMin = estimatedDelayMin;
            this.timeSavedMin = timeSavedMin;
            this.estimatedFareMyr = estimatedFareMyr;
            this.iconClass = iconClass;
            this.badgeText = badgeText;
        }

        public String getOptionType() { return optionType; }
        public String getTitle() { return title; }
        public String getDescription() { return description; }
        public double getEstimatedDelayMin() { return estimatedDelayMin; }
        public double getTimeSavedMin() { return timeSavedMin; }
        public double getEstimatedFareMyr() { return estimatedFareMyr; }
        public String getIconClass() { return iconClass; }
        public String getBadgeText() { return badgeText; }
    }

    public static class StationSearchResult {
        private BusStation originStation;
        private BusStation destinationStation;
        private BusTrip matchedTrip;
        private PredictionResult prediction;
        private String connectingRouteId;
        private String connectingRouteName;
        private double estimatedDistanceKm;
        private double estimatedBaseFareMyr;
        private List<AlternativeOption> alternatives = new ArrayList<>();
        private String summaryRationale;

        public BusStation getOriginStation() { return originStation; }
        public void setOriginStation(BusStation originStation) { this.originStation = originStation; }

        public BusStation getDestinationStation() { return destinationStation; }
        public void setDestinationStation(BusStation destinationStation) { this.destinationStation = destinationStation; }

        public BusTrip getMatchedTrip() { return matchedTrip; }
        public void setMatchedTrip(BusTrip matchedTrip) { this.matchedTrip = matchedTrip; }

        public PredictionResult getPrediction() { return prediction; }
        public void setPrediction(PredictionResult prediction) { this.prediction = prediction; }

        public String getConnectingRouteId() { return connectingRouteId; }
        public void setConnectingRouteId(String connectingRouteId) { this.connectingRouteId = connectingRouteId; }

        public String getConnectingRouteName() { return connectingRouteName; }
        public void setConnectingRouteName(String connectingRouteName) { this.connectingRouteName = connectingRouteName; }

        public double getEstimatedDistanceKm() { return estimatedDistanceKm; }
        public void setEstimatedDistanceKm(double estimatedDistanceKm) { this.estimatedDistanceKm = estimatedDistanceKm; }

        public double getEstimatedBaseFareMyr() { return estimatedBaseFareMyr; }
        public void setEstimatedBaseFareMyr(double estimatedBaseFareMyr) { this.estimatedBaseFareMyr = estimatedBaseFareMyr; }

        public List<AlternativeOption> getAlternatives() { return alternatives; }
        public void setAlternatives(List<AlternativeOption> alternatives) { this.alternatives = alternatives; }

        public String getSummaryRationale() { return summaryRationale; }
        public void setSummaryRationale(String summaryRationale) { this.summaryRationale = summaryRationale; }
    }

    public List<BusStation> searchStationsByKeyword(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return stationKb.getAllStations();
        }
        String q = keyword.trim().toLowerCase();
        return stationKb.getAllStations().stream()
                .filter(s -> s.getStationName().toLowerCase().contains(q) ||
                             s.getStationId().toLowerCase().contains(q) ||
                             s.getDistrict().toLowerCase().contains(q) ||
                             s.getRoutesServed().stream().anyMatch(r -> r.toLowerCase().contains(q)) ||
                             s.getTransitConnections().stream().anyMatch(c -> c.toLowerCase().contains(q)))
                .collect(Collectors.toList());
    }

    public StationSearchResult searchRoute(String originQuery, String destinationQuery, List<BusTrip> activeTrips) {
        StationSearchResult result = new StationSearchResult();

        // 1. Resolve origin and destination stations
        Optional<BusStation> destOpt = stationKb.findByNameOrQuery(destinationQuery);
        if (destOpt.isEmpty()) {
            destOpt = stationKb.getAllStations().stream().findFirst();
        }
        BusStation destStation = destOpt.orElseGet(() -> stationKb.getAllStations().get(0));
        result.setDestinationStation(destStation);

        Optional<BusStation> origOpt = stationKb.findByNameOrQuery(originQuery);
        BusStation origStation = origOpt.orElseGet(() -> {
            return stationKb.getAllStations().stream()
                    .filter(s -> !s.getStationId().equals(destStation.getStationId()))
                    .findFirst()
                    .orElse(destStation);
        });
        result.setOriginStation(origStation);

        // Calculate approximate Haversine distance in km
        double dist = calculateDistanceKm(origStation.getLatitude(), origStation.getLongitude(),
                destStation.getLatitude(), destStation.getLongitude());
        result.setEstimatedDistanceKm(Math.round(dist * 10.0) / 10.0);
        result.setEstimatedBaseFareMyr(Math.round((1.00 + (dist * 0.15)) * 100.0) / 100.0);

        // 2. Find matching bus trip connecting these routes or serving the destination
        BusTrip matchedTrip = null;
        for (BusTrip trip : activeTrips) {
            boolean servesDest = destStation.getRoutesServed().contains(trip.getRouteId());
            boolean servesOrig = origStation.getRoutesServed().contains(trip.getRouteId());
            if (servesDest && servesOrig) {
                matchedTrip = trip;
                break;
            }
        }
        if (matchedTrip == null) {
            for (BusTrip trip : activeTrips) {
                if (destStation.getRoutesServed().contains(trip.getRouteId())) {
                    matchedTrip = trip;
                    break;
                }
            }
        }
        if (matchedTrip == null && !activeTrips.isEmpty()) {
            matchedTrip = activeTrips.get(0);
        }

        result.setMatchedTrip(matchedTrip);
        if (matchedTrip != null) {
            result.setConnectingRouteId(matchedTrip.getRouteId());
            result.setConnectingRouteName(matchedTrip.getRouteName());

            PredictionResult pred = predictor.predict(matchedTrip);
            result.setPrediction(pred);

            // 3. Generate Smart Alternative Options
            double predictedDelay = pred.getPredictedDelayMinutes();

            // Alternative Option 1: Rail Bypass (LRT / MRT Transfer)
            if (!destStation.getTransitConnections().isEmpty() || !origStation.getTransitConnections().isEmpty()) {
                String railName = !destStation.getTransitConnections().isEmpty() ? destStation.getTransitConnections().get(0) : "LRT / MRT Rapid Transit Line";
                String railDesc = String.format("Transfer to %s directly from %s to %s to bypass surface road bottleneck completely with guaranteed 0 min traffic delay.",
                        railName, origStation.getStationName(), destStation.getStationName());
                result.getAlternatives().add(new AlternativeOption(
                    "RAIL_BYPASS",
                    "🚆 Rail Bypass (" + railName + ")",
                    railDesc,
                    0.0,
                    predictedDelay,
                    Math.round((result.getEstimatedBaseFareMyr() + 0.90) * 100.0) / 100.0,
                    "fa-train-subway icon-emerald",
                    "RECOMMENDED (0 MIN TRAFFIC DELAY)"
                ));
            }

            // Alternative Option 2: AI Recovery Optimization (Standby / Reroute)
            RecoveryOptimizer.OptimizationResult optResult = optimizer.optimize(matchedTrip, pred);
            if (optResult.getSelectedCandidate() != null && optResult.getSelectedCandidate().getExpectedDelayReductionMin() > 0) {
                var cand = optResult.getSelectedCandidate();
                String aiDesc = String.format("Apply %s: %s. Reduces predicted delay from +%.1fm down to +%.1fm.",
                        cand.getTitle(), cand.getActionDetails(), predictedDelay, cand.getEstimatedPostActionDelayMin());
                result.getAlternatives().add(new AlternativeOption(
                    "AI_RECOVERY_STRATEGY",
                    "⚡ " + cand.getTitle(),
                    aiDesc,
                    cand.getEstimatedPostActionDelayMin(),
                    cand.getExpectedDelayReductionMin(),
                    result.getEstimatedBaseFareMyr(),
                    "fa-bolt icon-purple",
                    "SAVINGS: -" + String.format("%.1f", cand.getExpectedDelayReductionMin()) + " MIN"
                ));
            }

            // Alternative Option 3: Parallel Feeder Bus Route
            String altRouteId = "Route " + (matchedTrip.getRouteId().startsWith("B") ? "770" : "B115");
            if (altRouteId.contains(matchedTrip.getRouteId())) altRouteId = "Route 780";
            result.getAlternatives().add(new AlternativeOption(
                "PARALLEL_BUS_ROUTE",
                "🚌 Parallel Route Option (" + altRouteId + ")",
                String.format("Board %s at %s. Operates along secondary express lane with lower traffic congestion.", altRouteId, origStation.getStationName()),
                Math.max(2.0, predictedDelay * 0.35),
                Math.max(0.0, predictedDelay * 0.65),
                result.getEstimatedBaseFareMyr(),
                "fa-bus-simple icon-blue",
                "LOW CONGESTION ALTERNATIVE"
            ));

            result.setSummaryRationale(String.format(
                "Direct Bus Route %s is currently experiencing a predicted delay of +%.1f minutes (%s Risk) due to %s. " +
                "%d alternative travel options are available.",
                matchedTrip.getRouteId(), predictedDelay, pred.getRiskLevel().getLabel(), pred.getPrimaryFactor(), result.getAlternatives().size()
            ));
        }

        return result;
    }

    private double calculateDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        double r = 6371; // Earth radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.max(3.5, r * c);
    }
}
