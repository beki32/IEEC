import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';

import '../models/firestore_models.dart';

class MonthlyContributionsLedger extends StatelessWidget {
  const MonthlyContributionsLedger({super.key});

  Future<void> _setStatus(Contribution contribution, String status) async {
    await FirebaseFirestore.instance.collection('contributions').doc(contribution.id).update({
      'status': status,
      'paidDate': status == 'paid' ? FieldValue.serverTimestamp() : null,
    });
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<QuerySnapshot<Map<String, dynamic>>>(
      stream: FirebaseFirestore.instance.collection('contributions').orderBy('monthYear', descending: true).snapshots(),
      builder: (context, snapshot) {
        if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
        final rows = snapshot.data!.docs.map((doc) => Contribution.fromJson(doc.data())).toList();
        if (rows.isEmpty) return const Center(child: Text('No contribution records yet.'));
        return SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Align(
                    alignment: Alignment.centerRight,
                    child: OutlinedButton.icon(
                      onPressed: () => ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Receipt export hook ready for Cloud Functions or CSV integration.'))),
                      icon: const Icon(Icons.download),
                      label: const Text('Export receipts'),
                    ),
                  ),
                  DataTable(
                    columns: const [
                      DataColumn(label: Text('Month')),
                      DataColumn(label: Text('Minister')),
                      DataColumn(label: Text('Amount')),
                      DataColumn(label: Text('Auto-pay')),
                      DataColumn(label: Text('Status')),
                      DataColumn(label: Text('Receipts')),
                    ],
                    rows: rows.map((row) => DataRow(cells: [
                          DataCell(Text(row.monthYear)),
                          DataCell(Text(row.userId)),
                          DataCell(Text('\$${row.amount.toStringAsFixed(2)}')),
                          DataCell(Icon(row.autoPay ? Icons.check_circle : Icons.cancel, color: row.autoPay ? Colors.green : Colors.grey)),
                          DataCell(DropdownButton<String>(
                            value: row.status,
                            underline: const SizedBox.shrink(),
                            items: const [
                              DropdownMenuItem(value: 'paid', child: Text('Paid')),
                              DropdownMenuItem(value: 'pending', child: Text('Pending')),
                              DropdownMenuItem(value: 'failed', child: Text('Failed')),
                            ],
                            onChanged: (value) => value == null ? null : _setStatus(row, value),
                          )),
                          DataCell(Text(row.receipts.length.toString())),
                        ])).toList(),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
