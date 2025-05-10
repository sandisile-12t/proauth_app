import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import '../Models/interaction_request.dart';

class InteractionProvider with ChangeNotifier {
  final List<InteractionRequest> _interactions = [];

  List<InteractionRequest> get interactions => _interactions;

  void addInteraction(InteractionRequest request) {
    _interactions.add(request);
    notifyListeners();
  }

  Future<void> fetchInteractions() async {
    try {
      final user = FirebaseAuth.instance.currentUser;
      if (user == null) return;

      final snapshot = await FirebaseFirestore.instance
          .collection('user_interactions')
          .where('userId', isEqualTo: user.uid) // ← filter here
          .get();

      _interactions.clear();

      for (var doc in snapshot.docs) {
        final data = doc.data();
        final userId = data['userId'] ?? '';
        final displayName = await _getUserDisplayName(userId);

        _interactions.add(InteractionRequest(
          id: doc.id,
          userId: userId,
          companyId: data['companyId'] ?? '',
          bidId: data['bidId'] ?? '',
          bidNumber: data['bidNumber'] ?? '',
          bidDescription: data['bidDescription'] ?? 'N/A',
          requestDate: (data['requestDate'] as Timestamp?)?.toDate() ?? DateTime.now(),
          feedbackDate: (data['timestamp'] as Timestamp?)?.toDate(),
          isApproved: data['status'] == 'Approved',
          isDeclined: data['status'] == 'Declined',
          responderName: displayName,
        ));
      }

      notifyListeners();
    } catch (e) {
      print('Error fetching interactions: $e');
      rethrow;
    }
  }


  Future<String> _getUserDisplayName(String userId) async {
    try {
      final userSnap = await FirebaseFirestore.instance.collection('users').doc(userId).get();
      if (userSnap.exists) {
        final userData = userSnap.data();
        return userData?['PersonnelName'] ?? userData?['name'] ?? userData?['email'] ?? 'Unknown';
      }

      final organSnap = await FirebaseFirestore.instance.collection('organs').doc(userId).get();
      if (organSnap.exists) {
        return organSnap.data()?['organName'] ?? 'Unknown Organ';
      }

      final companySnap = await FirebaseFirestore.instance.collection('company_users').doc(userId).get();
      if (companySnap.exists) {
        return companySnap.data()?['companyName'] ?? 'Unknown Company';
      }
    } catch (e) {
      print('Error fetching user display name: $e');
    }
    return 'Unknown';
  }

  Future<void> addRequest() async {
    try {
      final user = FirebaseAuth.instance.currentUser;
      if (user == null) throw Exception("No authenticated user");

      final bidId = user.uid;

      final requestRef = FirebaseFirestore.instance.collection('requests').doc();

      await requestRef.set({
        'companyId': 'company123', // Replace with actual company ID
        'bidId': bidId,
        'status': 'pending',
        'timestamp': FieldValue.serverTimestamp(),
      });

      print("Request added successfully!");
    } catch (e) {
      print("Error adding request: $e");
    }
  }

  Future<void> updateStatus(
      String requestId, {
        required bool approved,
        DateTime? feedbackDate,
        bool declined = false,
      }) async {
    final index = _interactions.indexWhere((r) => r.id == requestId);
    if (index != -1) {
      final original = _interactions[index];

      String bidDescription = original.bidDescription;
      if (bidDescription == 'N/A' && original.bidId.isNotEmpty) {
        final bidSnap = await FirebaseFirestore.instance
            .collection('tenders')
            .doc(original.bidId)
            .get();

        if (bidSnap.exists) {
          bidDescription = bidSnap.data()?['description'] ?? 'N/A';
        }
      }

      final updated = original.copyWith(
        isApproved: approved,
        isDeclined: declined,
        feedbackDate: feedbackDate ?? DateTime.now(),
        bidDescription: bidDescription,
      );

      _interactions[index] = updated;
      notifyListeners();

      final timestamp = Timestamp.fromDate(updated.feedbackDate ?? DateTime.now());
      final status = approved ? 'Approved' : 'Declined';

      final existing = await FirebaseFirestore.instance
          .collection('user_interactions')
          .where('requestId', isEqualTo: requestId)
          .where('userId', isEqualTo: updated.userId)
          .get();

      if (existing.docs.isEmpty) {
        await FirebaseFirestore.instance.collection('user_interactions').add({
          'userId': updated.userId,
          'requestId': requestId,
          'companyId': updated.companyId,
          'bidId': updated.bidId,
          'bidNumber': updated.bidNumber,
          'requestDate': Timestamp.fromDate(updated.requestDate),
          'status': status,
          'timestamp': timestamp,
          'responderId': updated.userId,
          'bidDescription': bidDescription,
        });
      }

      await FirebaseFirestore.instance.collection('requests').doc(requestId).set({
        'userId': updated.userId,
        'companyId': updated.companyId,
        'bidId': updated.bidId,
        'bidNumber': updated.bidNumber,
        'bidDescription': bidDescription,
        'status': status,
        'timestamp': timestamp,
        'toUserId': updated.userId,
      });
    }
  }

  void approveInteraction(String id, DateTime feedbackDate) {
    final index = _interactions.indexWhere((r) => r.id == id);
    if (index != -1) {
      _interactions[index] = _interactions[index].copyWith(
        isApproved: true,
        feedbackDate: feedbackDate,
      );
      notifyListeners();
    }
  }

  List<InteractionRequest> getByUser(String userId) =>
      _interactions.where((r) => r.userId == userId).toList();

  List<InteractionRequest> getByCompany(String companyId) =>
      _interactions.where((r) => r.companyId == companyId).toList();

  List<InteractionRequest> getByOrgan(String bidId) =>
      _interactions.where((r) => r.bidId == bidId).toList();
}


