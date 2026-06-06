<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>District Curriculum Report</title>
    <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; color: #333; line-height: 1.5; }
        .header { text-align: center; border-bottom: 2px solid #eab308; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #800000; margin-bottom: 5px; text-transform: uppercase; }
        .header p { color: #666; font-size: 14px; margin: 0; }
        
        .section-title { background: #f4f4f4; padding: 10px; border-left: 5px solid #eab308; font-weight: bold; margin-bottom: 20px; text-transform: uppercase; font-size: 16px; }
        
        .stats-grid { display: flex; flex-wrap: wrap; margin-bottom: 30px; }
        .stat-card { width: 23%; padding: 15px; border: 1px solid #ddd; border-radius: 10px; text-align: center; margin-right: 2%; }
        .stat-card:last-child { margin-right: 0; }
        .stat-value { font-size: 24px; font-weight: bold; color: #800000; }
        .stat-label { font-size: 10px; color: #666; text-transform: uppercase; font-weight: bold; margin-top: 5px; }

        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { background-color: #f8f9fa; color: #495057; font-weight: bold; text-align: left; padding: 12px; border-bottom: 2px solid #dee2e6; font-size: 12px; text-transform: uppercase; }
        td { padding: 12px; border-bottom: 1px solid #dee2e6; font-size: 12px; }
        
        .health-badge { padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 10px; }
        .health-high { background: #d1fae5; color: #065f46; }
        .health-mid { background: #fef3c7; color: #92400e; }
        .health-low { background: #fee2e2; color: #991b1b; }

        .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 10px; color: #999; padding-top: 20px; border-top: 1px solid #eee; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $district_name }}</h1>
        <p>Official Curriculum & Pathfinder Progress Report</p>
        <p>Generated on {{ date('F d, Y') }}</p>
    </div>

    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-value">{{ $totals['Total'] }}</div>
            <div class="stat-label">Total Pathfinders</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">{{ $honour_analytics['total_earned'] }}</div>
            <div class="stat-label">Honours Earned</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">{{ $totals['Ready'] }}</div>
            <div class="stat-label">Investiture Ready</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">{{ $avg_health }}%</div>
            <div class="stat-label">District Health</div>
        </div>
    </div>

    <div class="section-title">Club Performance & Compliance</div>
    <table>
        <thead>
            <tr>
                <th>Club Name</th>
                <th>Health</th>
                <th>Class Distribution (F/C/E/R/V/G)</th>
                <th>Ready</th>
                <th>Honours</th>
            </tr>
        </thead>
        <tbody>
            @foreach($curriculum_stats as $club)
                <tr>
                    <td><strong>{{ $club['church']['name'] }}</strong></td>
                    <td>
                        <span class="health-badge {{ $club['health_score'] >= 80 ? 'health-high' : ($club['health_score'] >= 50 ? 'health-mid' : 'health-low') }}">
                            {{ $club['health_score'] }}%
                        </span>
                    </td>
                    <td>
                        {{ $club['stats']['Friend'] }}/{{ $club['stats']['Companion'] }}/{{ $club['stats']['Explorer'] }}/{{ $club['stats']['Ranger'] }}/{{ $club['stats']['Voyager'] }}/{{ $club['stats']['Guide'] }}
                    </td>
                    <td>{{ $club['stats']['Ready'] }}</td>
                    <td>{{ $club['honours_earned'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="section-title">Top District Honours</div>
    <table>
        <thead>
            <tr>
                <th>Rank</th>
                <th>Honour Name</th>
                <th>Pathfinders Completed</th>
            </tr>
        </thead>
        <tbody>
            @foreach($honour_analytics['top_honours'] as $index => $honour)
                <tr>
                    <td>#{{ $index + 1 }}</td>
                    <td>{{ $honour['name'] }}</td>
                    <td>{{ $honour['count'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        KTD Management System - Ministry-accurate tracking of Pathfinder learning and leadership development.
    </div>
</body>
</html>
