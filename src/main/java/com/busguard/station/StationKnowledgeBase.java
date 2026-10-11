package com.busguard.station;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class StationKnowledgeBase {

    private final List<BusStation> stations = new ArrayList<>();

    public StationKnowledgeBase() {
        loadStationKnowledge();
    }

    private void loadStationKnowledge() {
        stations.add(new BusStation(
            "STN-KL-SENTRAL", "KL Sentral Transport Hub", "Kuala Lumpur", 3.1340, 101.6865,
            List.of("770", "B115", "750"),
            List.of("LRT Kelana Jaya Line", "MRT Museum Negara", "KTM Komuter", "KLIA Transit"),
            true, "Primary multi-modal transit hub connecting central KL to Petaling Jaya and Klang."
        ));

        stations.add(new BusStation(
            "STN-PASAR-SENI", "Hub Pasar Seni", "City Centre", 3.1420, 101.6940,
            List.of("780", "600", "100", "450", "590", "772"),
            List.of("LRT Kelana Jaya Line", "MRT Pasar Seni", "GO KL City Bus"),
            true, "Major downtown Rapid KL bus terminus with seamless LRT and MRT interchange."
        ));

        stations.add(new BusStation(
            "STN-MID-VALLEY", "Mid Valley Hub", "Kuala Lumpur", 3.1176, 101.6775,
            List.of("770"),
            List.of("KTM Mid Valley", "LRT Abdullah Hukum"),
            false, "High-density commercial corridor along Federal Highway."
        ));

        stations.add(new BusStation(
            "STN-SUBANG-JAYA", "Subang Jaya Station Hub", "Subang Jaya", 3.1480, 101.5450,
            List.of("770", "772"),
            List.of("LRT Kelana Jaya Line", "KTM Subang Jaya"),
            true, "Subang Jaya transit node serving Federal Highway corridors."
        ));

        stations.add(new BusStation(
            "STN-KERAMAT", "Complex Keramat Terminal", "Keramat", 3.1650, 101.7250,
            List.of("B115"),
            List.of("LRT Damai", "LRT Dato Keramat"),
            false, "Residential and commercial feeder hub in East KL."
        ));

        stations.add(new BusStation(
            "STN-SHAH-ALAM", "Shah Alam Sek 14 Bus Terminal", "Shah Alam", 3.0720, 101.5180,
            List.of("750"),
            List.of("Rapid KL Feeder", "KTM Shah Alam"),
            false, "Main Selangor state capital bus terminal connecting Central Market."
        ));

        stations.add(new BusStation(
            "STN-PANDAN-INDAH", "Pandan Indah Bus Hub", "Ampang", 3.1490, 101.7120,
            List.of("300"),
            List.of("LRT Pandan Indah", "LRT Cempaka"),
            false, "Ampang corridor feeder terminal with frequent peak congestion."
        ));

        stations.add(new BusStation(
            "STN-KOTA-DAMANSARA", "Kota Damansara Hub", "Petaling Jaya", 3.1510, 101.5920,
            List.of("780"),
            List.of("MRT Kota Damansara", "MRT Surian"),
            false, "Northern PJ suburban terminal connected to Pasar Seni via Route 780."
        ));

        stations.add(new BusStation(
            "STN-PUCHONG-UTAMA", "Hab Puchong Utama", "Puchong", 3.0330, 101.6210,
            List.of("600"),
            List.of("LRT Puchong Perdana", "LRT Puchong Utama"),
            true, "Major South Klang Valley hub operating along LDP corridor."
        ));

        stations.add(new BusStation(
            "STN-WANGSA-MAJU", "LRT Wangsa Maju Hub", "Wangsa Maju", 3.2050, 101.7320,
            List.of("250", "T801"),
            List.of("LRT Wangsa Maju", "LRT Sri Rampai"),
            false, "Northeast KL residential and feeder bus junction."
        ));

        stations.add(new BusStation(
            "STN-HENTIAN-KAJANG", "Hentian Kajang Hub", "Kajang", 2.9820, 101.7850,
            List.of("450"),
            List.of("MRT Kajang Line", "KTM Kajang"),
            true, "Southern Klang Valley regional terminal serving Cheras Highway."
        ));

        stations.add(new BusStation(
            "STN-SUNGAI-LONG", "Hab Bandar Sungai Long", "Kajang / Cheras", 3.0450, 101.7920,
            List.of("590"),
            List.of("MRT Batu 11 Cheras Feeder"),
            false, "University and residential feeder terminal connecting Hub Lebuh Pudu."
        ));

        stations.add(new BusStation(
            "STN-KUALA-SELANGOR", "Kuala Selangor Terminal", "Kuala Selangor", 3.3500, 101.2500,
            List.of("100"),
            List.of("Selangor Omnibus Regional"),
            false, "North-West coastal terminal connecting downtown KL."
        ));
    }

    public List<BusStation> getAllStations() {
        return stations;
    }

    public Optional<BusStation> findById(String stationId) {
        return stations.stream()
                .filter(s -> s.getStationId().equalsIgnoreCase(stationId))
                .findFirst();
    }

    public Optional<BusStation> findByNameOrQuery(String query) {
        if (query == null || query.trim().isEmpty()) return Optional.empty();
        String q = query.trim().toLowerCase();
        return stations.stream()
                .filter(s -> s.getStationName().toLowerCase().contains(q) ||
                             s.getStationId().toLowerCase().contains(q) ||
                             s.getDistrict().toLowerCase().contains(q))
                .findFirst();
    }
}
