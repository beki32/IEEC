import 'package:cloud_firestore/cloud_firestore.dart';

DateTime? _toDate(dynamic value) {
  if (value == null) return null;
  if (value is Timestamp) return value.toDate();
  if (value is DateTime) return value;
  if (value is String) return DateTime.tryParse(value);
  return null;
}

Timestamp? _toTimestamp(DateTime? value) => value == null ? null : Timestamp.fromDate(value);

List<String> _stringList(dynamic value) => value is Iterable ? value.map((e) => e.toString()).toList() : <String>[];

double _toDouble(dynamic value) {
  if (value is num) return value.toDouble();
  return double.tryParse(value?.toString() ?? '') ?? 0;
}

int _toInt(dynamic value) {
  if (value is num) return value.toInt();
  return int.tryParse(value?.toString() ?? '') ?? 0;
}

class UserProfile {
  const UserProfile({
    required this.uid,
    required this.fullName,
    required this.email,
    required this.phone,
    required this.gender,
    required this.dateOfBirth,
    required this.address,
    required this.status,
    required this.firstVisitDate,
    required this.notes,
    required this.emergencyContact,
    required this.spiritualGrowthStatus,
    required this.roles,
    required this.assignedTeams,
    required this.bibleStudyGroupId,
    required this.g5GroupId,
  });

  final String uid;
  final String fullName;
  final String email;
  final String phone;
  final String gender;
  final DateTime? dateOfBirth;
  final String address;
  final String status;
  final DateTime? firstVisitDate;
  final String notes;
  final String emergencyContact;
  final String spiritualGrowthStatus;
  final List<String> roles;
  final List<String> assignedTeams;
  final String bibleStudyGroupId;
  final String g5GroupId;

  factory UserProfile.fromJson(Map<String, dynamic> json) => UserProfile(
        uid: json['uid']?.toString() ?? '',
        fullName: json['fullName']?.toString() ?? '',
        email: json['email']?.toString() ?? '',
        phone: json['phone']?.toString() ?? '',
        gender: json['gender']?.toString() ?? '',
        dateOfBirth: _toDate(json['dateOfBirth']),
        address: json['address']?.toString() ?? '',
        status: json['status']?.toString() ?? 'new_comer',
        firstVisitDate: _toDate(json['firstVisitDate']),
        notes: json['notes']?.toString() ?? '',
        emergencyContact: json['emergencyContact']?.toString() ?? '',
        spiritualGrowthStatus: json['spiritualGrowthStatus']?.toString() ?? 'new',
        roles: _stringList(json['roles']),
        assignedTeams: _stringList(json['assignedTeams']),
        bibleStudyGroupId: json['bibleStudyGroupId']?.toString() ?? '',
        g5GroupId: json['g5GroupId']?.toString() ?? '',
      );

  Map<String, dynamic> toJson() => {
        'uid': uid,
        'fullName': fullName,
        'email': email,
        'phone': phone,
        'gender': gender,
        'dateOfBirth': _toTimestamp(dateOfBirth),
        'address': address,
        'status': status,
        'firstVisitDate': _toTimestamp(firstVisitDate),
        'notes': notes,
        'emergencyContact': emergencyContact,
        'spiritualGrowthStatus': spiritualGrowthStatus,
        'roles': roles,
        'assignedTeams': assignedTeams,
        'bibleStudyGroupId': bibleStudyGroupId,
        'g5GroupId': g5GroupId,
      };

  bool get isStaff => roles.contains('head_leader') || roles.contains('core_team');
  bool get isMinister => roles.contains('minister');
  bool get isLeader => roles.any((role) => ['head_leader', 'core_team', 'team_leader'].contains(role));
}

class MinistryTeam {
  const MinistryTeam({
    required this.id,
    required this.name,
    required this.targetGroupSize,
    required this.createdAt,
  });

  final String id;
  final String name;
  final int targetGroupSize;
  final DateTime? createdAt;

  factory MinistryTeam.fromJson(Map<String, dynamic> json) => MinistryTeam(
        id: json['id']?.toString() ?? '',
        name: json['name']?.toString() ?? '',
        targetGroupSize: _toInt(json['targetGroupSize']),
        createdAt: _toDate(json['createdAt']),
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'targetGroupSize': targetGroupSize,
        'createdAt': _toTimestamp(createdAt),
      };
}

class G5Group {
  const G5Group({
    required this.id,
    required this.name,
    required this.teamId,
    required this.leaderId,
    required this.maxCapacity,
    required this.memberIds,
    required this.currentMemberCount,
  });

  final String id;
  final String name;
  final String teamId;
  final String leaderId;
  final int maxCapacity;
  final List<String> memberIds;
  final int currentMemberCount;

  factory G5Group.fromJson(Map<String, dynamic> json) {
    final members = _stringList(json['memberIds']);
    return G5Group(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      teamId: json['teamId']?.toString() ?? '',
      leaderId: json['leaderId']?.toString() ?? '',
      maxCapacity: _toInt(json['maxCapacity']),
      memberIds: members,
      currentMemberCount: _toInt(json['currentMemberCount']) == 0 ? members.length : _toInt(json['currentMemberCount']),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'teamId': teamId,
        'leaderId': leaderId,
        'maxCapacity': maxCapacity,
        'memberIds': memberIds,
        'currentMemberCount': currentMemberCount,
      };
}

class TeamChat {
  const TeamChat({required this.id, required this.teamId, required this.allowedMemberIds});

  final String id;
  final String teamId;
  final List<String> allowedMemberIds;

  factory TeamChat.fromJson(Map<String, dynamic> json) => TeamChat(
        id: json['id']?.toString() ?? '',
        teamId: json['teamId']?.toString() ?? '',
        allowedMemberIds: _stringList(json['allowedMemberIds']),
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'teamId': teamId,
        'allowedMemberIds': allowedMemberIds,
      };
}

class ChatMessage {
  const ChatMessage({
    required this.senderId,
    required this.senderName,
    required this.text,
    required this.timestamp,
  });

  final String senderId;
  final String senderName;
  final String text;
  final DateTime? timestamp;

  factory ChatMessage.fromJson(Map<String, dynamic> json) => ChatMessage(
        senderId: json['senderId']?.toString() ?? '',
        senderName: json['senderName']?.toString() ?? '',
        text: json['text']?.toString() ?? '',
        timestamp: _toDate(json['timestamp']),
      );

  Map<String, dynamic> toJson() => {
        'senderId': senderId,
        'senderName': senderName,
        'text': text,
        'timestamp': timestamp == null ? FieldValue.serverTimestamp() : _toTimestamp(timestamp),
      };
}

class Contribution {
  const Contribution({
    required this.id,
    required this.userId,
    required this.amount,
    required this.monthYear,
    required this.status,
    required this.autoPay,
    required this.paidDate,
    required this.receipts,
  });

  final String id;
  final String userId;
  final double amount;
  final String monthYear;
  final String status;
  final bool autoPay;
  final DateTime? paidDate;
  final List<String> receipts;

  factory Contribution.fromJson(Map<String, dynamic> json) => Contribution(
        id: json['id']?.toString() ?? '',
        userId: json['userId']?.toString() ?? '',
        amount: _toDouble(json['amount']),
        monthYear: json['monthYear']?.toString() ?? '',
        status: json['status']?.toString() ?? 'pending',
        autoPay: json['autoPay'] == true,
        paidDate: _toDate(json['paidDate']),
        receipts: _stringList(json['receipts']),
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'userId': userId,
        'amount': amount,
        'monthYear': monthYear,
        'status': status,
        'autoPay': autoPay,
        'paidDate': _toTimestamp(paidDate),
        'receipts': receipts,
      };
}

class NewComer {
  const NewComer({
    required this.id,
    required this.fullName,
    required this.phone,
    required this.email,
    required this.status,
    required this.assignedLeaderId,
    required this.currentStep,
  });

  final String id;
  final String fullName;
  final String phone;
  final String email;
  final String status;
  final String assignedLeaderId;
  final String currentStep;

  factory NewComer.fromJson(Map<String, dynamic> json) => NewComer(
        id: json['id']?.toString() ?? '',
        fullName: json['fullName']?.toString() ?? '',
        phone: json['phone']?.toString() ?? '',
        email: json['email']?.toString() ?? '',
        status: json['status']?.toString() ?? 'registered',
        assignedLeaderId: json['assignedLeaderId']?.toString() ?? '',
        currentStep: json['currentStep']?.toString() ?? 'register_new_comer',
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'fullName': fullName,
        'phone': phone,
        'email': email,
        'status': status,
        'assignedLeaderId': assignedLeaderId,
        'currentStep': currentStep,
      };
}

class FollowUpUpdate {
  const FollowUpUpdate({
    required this.leaderId,
    required this.updateText,
    required this.date,
    required this.outcome,
  });

  final String leaderId;
  final String updateText;
  final DateTime? date;
  final String outcome;

  factory FollowUpUpdate.fromJson(Map<String, dynamic> json) => FollowUpUpdate(
        leaderId: json['leaderId']?.toString() ?? '',
        updateText: json['updateText']?.toString() ?? '',
        date: _toDate(json['date']),
        outcome: json['outcome']?.toString() ?? '',
      );

  Map<String, dynamic> toJson() => {
        'leaderId': leaderId,
        'updateText': updateText,
        'date': _toTimestamp(date),
        'outcome': outcome,
      };
}
