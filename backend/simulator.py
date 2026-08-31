"""
Simulates grid assets and sensor/drone telemetry events, standing in for
real SCADA, thermal camera, LiDAR and acoustic sensor feeds at TRL-2.
"""
import random

ASSETS = [
    {"id": "sub-001", "name": "Substation Alpha (Berlin-Nord)", "type": "substation", "voltage": "HV", "x": 22, "y": 18},
    {"id": "sub-002", "name": "Substation Beta (Spandau)", "type": "substation", "voltage": "HV", "x": 55, "y": 12},
    {"id": "line-003", "name": "Overhead Line 3 (Rural Feeder)", "type": "overhead_line", "voltage": "MV", "x": 40, "y": 40},
    {"id": "line-004", "name": "Overhead Line 4 (Forest Corridor)", "type": "overhead_line", "voltage": "MV", "x": 72, "y": 55},
    {"id": "sub-005", "name": "Substation Gamma (Charlottenburg)", "type": "substation", "voltage": "HV", "x": 30, "y": 70},
    {"id": "und-006", "name": "Underground Feeder 6 (City Core)", "type": "underground", "voltage": "LV", "x": 60, "y": 78},
    {"id": "line-007", "name": "Overhead Line 7 (Coastal Span)", "type": "overhead_line", "voltage": "MV", "x": 85, "y": 30},
]

EVENT_TEMPLATES = [
    {
        "kind": "conductive_object",
        "sensor": "acoustic + thermal drone patrol",
        "detail": "Metallic object trajectory detected arcing toward conductor at {clearance}m clearance.",
    },
    {
        "kind": "perimeter_breach",
        "sensor": "LiDAR perimeter fence",
        "detail": "Motion signature crossed substation fence line at {clearance}m from control building, no badge scan logged.",
    },
    {
        "kind": "thermal_deviation",
        "sensor": "infrared thermal camera",
        "detail": "Hotspot of {temp}C detected on transformer bushing, {delta}C above 24h rolling baseline.",
    },
    {
        "kind": "vegetation_encroachment",
        "sensor": "LiDAR aerial patrol",
        "detail": "Vegetation canopy measured {clearance}m from conductor, below the 3m statutory clearance.",
    },
    {
        "kind": "corona_discharge",
        "sensor": "UV corona camera",
        "detail": "Corona discharge intensity spike detected on insulator string, {photons} photon counts/s.",
    },
    {
        "kind": "wildlife",
        "sensor": "acoustic + motion sensor",
        "detail": "Motion and heat signature consistent with wildlife near pole base, no sustained proximity to conductor.",
    },
    {
        "kind": "routine_wear",
        "sensor": "vibration sensor",
        "detail": "Minor vibration anomaly on transformer casing, magnitude within historical wear-and-tear range.",
    },
    {
        "kind": "gas_leak",
        "sensor": "SF6 gas concentration sensor",
        "detail": "SF6 concentration reading {gas}ppm above nominal near switchgear enclosure.",
    },
]


def generate_event():
    asset = random.choice(ASSETS)
    template = random.choice(EVENT_TEMPLATES)
    detail = template["detail"].format(
        clearance=round(random.uniform(0.3, 4.0), 1),
        temp=round(random.uniform(45, 110), 1),
        delta=round(random.uniform(8, 45), 1),
        photons=random.randint(200, 4000),
        gas=round(random.uniform(1.5, 12.0), 1),
    )
    return {
        "asset_id": asset["id"],
        "asset_name": asset["name"],
        "asset_voltage": asset["voltage"],
        "kind": template["kind"],
        "sensor_source": template["sensor"],
        "raw_detail": detail,
        "weather": random.choice(["clear", "rain", "fog", "high wind (12 m/s)", "snow", "night / low visibility"]),
    }
