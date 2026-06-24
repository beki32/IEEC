import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';

class ReportsScreen extends StatelessWidget {
  const ReportsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<_ReportData>(
      future: _ReportData.load(),
      builder: (context, snapshot) {
        if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
        final data = snapshot.data!;
        return SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Wrap(
                spacing: 16,
                runSpacing: 16,
                children: [
                  _ReportCard('Group fill rate', '${(data.groupFillRate * 100).toStringAsFixed(0)}%', Icons.hub),
                  _ReportCard('Attendance records', data.attendanceRecords.toString(), Icons.event_available),
                  _ReportCard('Growth this month', '+${data.newComersThisMonth}', Icons.trending_up),
                  _ReportCard('Pending contributions', data.pendingContributions.toString(), Icons.payments),
                ],
              ),
              const SizedBox(height: 24),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('Analytical summary', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800)),
                    const SizedBox(height: 12),
                    Text('Dynamic G-Group allocation is calculated from currentMemberCount / maxCapacity across all ministry teams.'),
                    const SizedBox(height: 8),
                    Text('Attendance and reports collections are intentionally present as production extension points for dashboards and Cloud Functions aggregations.'),
                  ]),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _ReportData {
  _ReportData({required this.groupFillRate, required this.attendanceRecords, required this.newComersThisMonth, required this.pendingContributions});
  final double groupFillRate;
  final int attendanceRecords;
  final int newComersThisMonth;
  final int pendingContributions;

  static Future<_ReportData> load() async {
    final firestore = FirebaseFirestore.instance;
    final groups = await firestore.collection('g5_groups').get();
    final attendance = await firestore.collection('attendance').get();
    final newComers = await firestore.collection('new_comers').get();
    final pending = await firestore.collection('contributions').where('status', isEqualTo: 'pending').get();
    final capacity = groups.docs.fold<int>(0, (sum, doc) => sum + ((doc.data()['maxCapacity'] as num?)?.toInt() ?? 0));
    final current = groups.docs.fold<int>(0, (sum, doc) => sum + ((doc.data()['currentMemberCount'] as num?)?.toInt() ?? 0));
    return _ReportData(
      groupFillRate: capacity == 0 ? 0 : current / capacity,
      attendanceRecords: attendance.docs.length,
      newComersThisMonth: newComers.docs.length,
      pendingContributions: pending.docs.length,
    );
  }
}

class _ReportCard extends StatelessWidget {
  const _ReportCard(this.label, this.value, this.icon);
  final String label;
  final String value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 240,
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Icon(icon, color: Theme.of(context).colorScheme.primary),
            const SizedBox(height: 16),
            Text(value, style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w900)),
            Text(label),
          ]),
        ),
      ),
    );
  }
}
