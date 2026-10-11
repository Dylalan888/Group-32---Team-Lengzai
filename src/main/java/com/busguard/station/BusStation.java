package com.busguard.station;

import java.util.ArrayList;
import java.util.List;

public class BusStation {

    private String stationId;
    private String stationName;
    private String district;
    private double latitude;
    private double longitude;
    private List<String> routesServed = new ArrayList<>();
    private List<String> transitConnections = new ArrayList<>();
    private boolean isDepotHub;
    private String description;

    public BusStation() {}

    public BusStation(String stationId, String stationName, String district, double latitude, double longitude,
                      List<String> routesServed, List<String> transitConnections, boolean isDepotHub, String description) {
        this.stationId = stationId;
        this.stationName = stationName;
        this.district = district;
        this.latitude = latitude;
        this.longitude = longitude;
        if (routesServed != null) this.routesServed = routesServed;
        if (transitConnections != null) this.transitConnections = transitConnections;
        this.isDepotHub = isDepotHub;
        this.description = description;
    }

    public String getStationId() { return stationId; }
    public void setStationId(String stationId) { this.stationId = stationId; }

    public String getStationName() { return stationName; }
    public void setStationName(String stationName) { this.stationName = stationName; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }

    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }

    public List<String> getRoutesServed() { return routesServed; }
    public void setRoutesServed(List<String> routesServed) { this.routesServed = routesServed; }

    public List<String> getTransitConnections() { return transitConnections; }
    public void setTransitConnections(List<String> transitConnections) { this.transitConnections = transitConnections; }

    public boolean isDepotHub() { return isDepotHub; }
    public void setDepotHub(boolean depotHub) { isDepotHub = depotHub; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
