import 'package:cloud_firestore/cloud_firestore.dart';

class PermissionRequest {
  final String id;
  final String bidNumber;
  final String bidId;
  final String bidDescription;
  final DateTime closingDate;
  final String userId;
  final String organName;
  final String companyName;
  final bool isApproved;
  final DateTime requestDate;

  PermissionRequest({
    required this.id,
    required this.bidId,
    required this.bidNumber,
    required this.bidDescription,
    required this.closingDate,
    required this.userId,
    required this.organName,
    required this.companyName,
    required this.isApproved,
    required this.requestDate,
  });

  factory PermissionRequest.fromJson(Map<String, dynamic> json) {
    return PermissionRequest(
      id: json['id'] ?? '',
      bidId: json['bidId'] ?? '',
      bidNumber: json['bidNumber'] ?? '',
      bidDescription: json['bidDescription'] ?? '',
      closingDate: _parseDate(json['closingDate']),
      userId: json['userId'] ?? '',
      organName: json['organName'] ?? '',
      companyName: json['companyName'] ?? '',
      isApproved: json['isApproved'] ?? false,
      requestDate: _parseDate(json['requestDate']),
    );
  }

  static DateTime _parseDate(dynamic value) {
    if (value is Timestamp) {
      return value.toDate();
    } else if (value is String) {
      return DateTime.parse(value);
    } else {
      throw FormatException("Invalid date format");
    }
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'bidNumber': bidNumber,
      'bidDescription': bidDescription,
      'closingDate': closingDate.toIso8601String(),
      'userId': userId,
      'bidId': bidId,
      'organName': organName,
      'companyName': companyName,
      'isApproved': isApproved,
      'requestDate': requestDate.toIso8601String(),
    };
  }

  PermissionRequest copyWith({String? id}) {
    return PermissionRequest(
      id: id ?? this.id,
      bidNumber: bidNumber,
      bidDescription: bidDescription,
      closingDate: closingDate,
      userId: userId,
      bidId: bidId,
      organName: organName,
      companyName: companyName,
      isApproved: isApproved,
      requestDate: requestDate,
    );
  }
}




