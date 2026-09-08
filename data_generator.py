#!/usr/bin/env python3
"""
Synthetic Session Telemetry & Capacity Data Generator
Generates 90 days of multi-tenant multiplayer session events, row growth,
index sizes, retention rule evictions, and storage telemetry.
"""

import os
import json
import random
import math
import csv
from datetime import datetime, timedelta

def generate_telemetry_dataset(output_dir="data"):
    os.makedirs(output_dir, exist_ok=True)
    
    tenants = [
        {"tenant_id": "tenant-alpha", "name": "Alpha Studio (FPS)", "base_rows": 50000, "daily_growth": 4500, "limit_mb": 500, "retention_days": 7},
        {"tenant_id": "tenant-beta", "name": "Beta Games (MMO)", "base_rows": 200000, "daily_growth": 18500, "limit_mb": 2000, "retention_days": 14},
        {"tenant_id": "tenant-gamma", "name": "Gamma Arcade (Casual)", "base_rows": 15000, "daily_growth": 1200, "limit_mb": 250, "retention_days": 3}
    ]

    start_date = datetime.now() - timedelta(days=60)
    rows_csv = []
    
    for day in range(90):
        current_date = start_date + timedelta(days=day)
        date_str = current_date.strftime("%Y-%m-%d")

        for tenant in tenants:
            tid = tenant["tenant_id"]
            # Seasonal tenant activity multiplier
            activity_mult = 1.0 + 0.3 * math.sin(day * 0.15) + random.uniform(-0.05, 0.05)
            
            # Row growth with retention eviction after threshold
            added_rows = int(tenant["daily_growth"] * activity_mult)
            evicted_rows = int(added_rows * 0.88) if day >= tenant["retention_days"] else 0
            net_rows = added_rows - evicted_rows

            table_bytes_per_row = 256
            index_bytes_per_row = 80 # B-Tree index overhead (idx_tenant_room + idx_session_token)

            # Cumulative row calculation
            prev_total_rows = tenant["base_rows"] + (day * net_rows)
            table_size_mb = (prev_total_rows * table_bytes_per_row) / (1024 * 1024)
            # Index bloat factor increases over time due to page fragmentation
            index_bloat_factor = 1.35 + (day * 0.004)
            index_size_mb = (prev_total_rows * index_bytes_per_row * index_bloat_factor) / (1024 * 1024)
            total_size_mb = table_size_mb + index_size_mb

            rows_csv.append({
                "date": date_str,
                "day_index": day,
                "tenant_id": tid,
                "tenant_name": tenant["name"],
                "active_sessions": int(100 * activity_mult * random.uniform(0.9, 1.1)),
                "added_rows": added_rows,
                "evicted_rows": evicted_rows,
                "total_rows": prev_total_rows,
                "table_size_mb": round(table_size_mb, 3),
                "index_size_mb": round(index_size_mb, 3),
                "total_size_mb": round(total_size_mb, 3),
                "storage_limit_mb": tenant["limit_mb"]
            })

    # Write CSV dataset
    csv_path = os.path.join(output_dir, "synthetic_session_telemetry.csv")
    with open(csv_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=rows_csv[0].keys())
        writer.writeheader()
        writer.writerows(rows_csv)

    # Write tenant config metadata JSON
    meta_path = os.path.join(output_dir, "tenant_metadata.json")
    with open(meta_path, "w") as f:
        json.dump(tenants, f, indent=2)

    print(f"✅ Generated {len(rows_csv)} telemetry records in '{csv_path}'")
    print(f"✅ Saved tenant metadata in '{meta_path}'")

if __name__ == "__main__":
    generate_telemetry_dataset()
