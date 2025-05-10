import 'package:cloud_firestore/cloud_firestore.dart';

class BidOrganModel {
  final String id;
  final String bidNumber;
  final String bidDescription;
  final DateTime closingDate;
  final List<String> keyPersonnel;
  final String adminType;
  final String organName;
  final String bidId;
  final String? email;
  final String? department;
  final String docId;

  BidOrganModel({
    required this.id,
    required this.bidNumber,
    required this.bidDescription,
    required this.closingDate,
    required this.keyPersonnel,
    required this.adminType,
    required this.organName,
    required this.bidId,
    this.email,
    this.department,
    required this.docId,
  });

  Map<String, dynamic> toJson() {
    return {
      'bidNumber': bidNumber,
      'bidDescription': bidDescription,
      'closingDate': Timestamp.fromDate(closingDate),
      'keyPersonnel': keyPersonnel,
      'adminType': adminType,
      'organName': organName,
      'bidId': bidId,
      'email': email,
      'department': department,
    };
  }

  factory BidOrganModel.fromFirestore(DocumentSnapshot doc) {
    final rawData = doc.data();
    if (rawData == null) {
      throw StateError('Missing data for document ID: ${doc.id}');
    }

    final data = rawData as Map<String, dynamic>;

    DateTime parsedClosingDate;
    final closingRaw = data['closingDate'];

    if (closingRaw is Timestamp) {
      parsedClosingDate = closingRaw.toDate();
    } else if (closingRaw is String) {
      parsedClosingDate = DateTime.tryParse(closingRaw) ?? DateTime.now();
    } else {
      parsedClosingDate = DateTime.now();
    }

    return BidOrganModel(
      id: doc.id,
      bidNumber: data['bidNumber'] ?? '',
      bidDescription: data['bidDescription'] ?? '',
      closingDate: parsedClosingDate,
      keyPersonnel: List<String>.from(data['keyPersonnel'] ?? []),
      adminType: data['adminType'] ?? '',
      organName: data['organName'] ?? '',
      bidId: data['bidId'] ?? '',
      email: data['email'],
      department: data['department'],
      docId: doc.id,
    );
  }

  BidOrganModel copyWith({
    String? bidNumber,
    String? bidDescription,
    DateTime? closingDate,
    List<String>? keyPersonnel,
    String? adminType,
    String? organName,
    String? bidId,
    String? email,
    String? department,
    String? docId,
  }) {
    return BidOrganModel(
      id: id,
      bidNumber: bidNumber ?? this.bidNumber,
      bidDescription: bidDescription ?? this.bidDescription,
      closingDate: closingDate ?? this.closingDate,
      keyPersonnel: keyPersonnel ?? this.keyPersonnel,
      adminType: adminType ?? this.adminType,
      organName: organName ?? this.organName,
      bidId: bidId ?? this.bidId,
      email: email ?? this.email,
      department: department ?? this.department,
      docId: docId ?? this.docId,
    );
  }

  bool isOrganOfState() => adminType.toLowerCase() == 'organ';
  bool isCompany() => adminType.toLowerCase() == 'company';
}








