import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

class NewComerRegistration extends StatefulWidget {
  const NewComerRegistration({super.key});
  static const routeName = '/new-comer-registration';

  @override
  State<NewComerRegistration> createState() => _NewComerRegistrationState();
}

class _NewComerRegistrationState extends State<NewComerRegistration> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _phone = TextEditingController();
  final _email = TextEditingController();
  String _assignedLeaderId = '';
  int _step = 0;
  bool _saving = false;

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    _email.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      final doc = FirebaseFirestore.instance.collection('new_comers').doc();
      final leaderId = _assignedLeaderId.isEmpty ? FirebaseAuth.instance.currentUser?.uid ?? '' : _assignedLeaderId;
      await doc.set({
        'id': doc.id,
        'fullName': _name.text.trim(),
        'phone': _phone.text.trim(),
        'email': _email.text.trim(),
        'status': 'registered',
        'assignedLeaderId': leaderId,
        'currentStep': 'assign_follow_up_leader',
        'createdAt': FieldValue.serverTimestamp(),
        'workflow': ['register_new_comer', 'assign_follow_up_leader', 'weekly_updates', 'active_member', 'bible_study_group', 'team_g_group'],
      });
      await doc.collection('follow_up_updates').add({
        'leaderId': leaderId,
        'updateText': 'New comer registered and ready for first follow up.',
        'date': FieldValue.serverTimestamp(),
        'outcome': 'pending_first_contact',
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('New comer added to follow-up pipeline.')));
      Navigator.pop(context);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Register New Comer')),
      body: Stepper(
        currentStep: _step,
        onStepContinue: _step == 2 ? (_saving ? null : _submit) : () => setState(() => _step += 1),
        onStepCancel: _step == 0 ? null : () => setState(() => _step -= 1),
        controlsBuilder: (context, details) => Padding(
          padding: const EdgeInsets.only(top: 16),
          child: Row(
            children: [
              FilledButton(onPressed: details.onStepContinue, child: Text(_step == 2 ? 'Submit' : 'Continue')),
              const SizedBox(width: 12),
              if (_step > 0) TextButton(onPressed: details.onStepCancel, child: const Text('Back')),
            ],
          ),
        ),
        steps: [
          Step(
            title: const Text('Contact details'),
            isActive: _step >= 0,
            content: Form(
              key: _formKey,
              child: Column(
                children: [
                  TextFormField(controller: _name, decoration: const InputDecoration(labelText: 'Full name'), validator: (value) => (value?.trim().isEmpty ?? true) ? 'Required' : null),
                  const SizedBox(height: 12),
                  TextFormField(controller: _phone, decoration: const InputDecoration(labelText: 'Phone'), validator: (value) => (value?.trim().isEmpty ?? true) ? 'Required' : null),
                  const SizedBox(height: 12),
                  TextFormField(controller: _email, decoration: const InputDecoration(labelText: 'Email')),
                ],
              ),
            ),
          ),
          Step(
            title: const Text('Follow-up leader'),
            isActive: _step >= 1,
            content: StreamBuilder<QuerySnapshot<Map<String, dynamic>>>(
              stream: FirebaseFirestore.instance.collection('users').where('roles', arrayContainsAny: ['head_leader', 'core_team', 'team_leader']).snapshots(),
              builder: (context, snapshot) {
                final leaders = snapshot.data?.docs ?? [];
                return DropdownButtonFormField<String>(
                  value: _assignedLeaderId.isEmpty ? null : _assignedLeaderId,
                  decoration: const InputDecoration(labelText: 'Assign leader'),
                  items: leaders.map((doc) => DropdownMenuItem(value: doc.id, child: Text(doc.data()['fullName']?.toString() ?? doc.id))).toList(),
                  onChanged: (value) => setState(() => _assignedLeaderId = value ?? ''),
                );
              },
            ),
          ),
          const Step(
            title: Text('Workflow confirmation'),
            isActive: true,
            content: Text('Pipeline: register -> follow-up -> weekly updates -> active member -> Bible Study -> Team/G-Group.'),
          ),
        ],
      ),
    );
  }
}
