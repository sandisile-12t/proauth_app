import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import '../Models/bid_organ_model.dart';

class BidProvider with ChangeNotifier {
  List<BidOrganModel> _tenderHistory = [];
  BidOrganModel? _bidOrganModel;

  List<BidOrganModel> get tenderHistory => _tenderHistory;
  BidOrganModel? get bidOrganModel => _bidOrganModel;

  // Fetch tenders for a specific organ
  Future<void> fetchTenderHistory(String organOfStateId) async {
    try {
      print('🔍 Fetching tenders posted by organ: $organOfStateId');

      final snapshot = await FirebaseFirestore.instance
          .collection('tenders')
          .where('postedBy', isEqualTo: organOfStateId) // Correct field
          .orderBy('postedAt', descending: true)
          .get();

      print('✅ Fetched tenders count: ${snapshot.docs.length}');

      _tenderHistory = snapshot.docs
          .map((doc) => BidOrganModel.fromFirestore(doc)) // Convert to BidOrganModel
          .toList();

      notifyListeners();
    } catch (e) {
      print('❌ Error fetching tenders: $e');
    }
  }

  // Fetch a specific tender by bidId
  Future<BidOrganModel?> getTenderForOrgan(String bidId) async {
    try {
      final querySnapshot = await FirebaseFirestore.instance
          .collection('tenders')
          .where('bidId', isEqualTo: bidId)
          .limit(1)
          .get();

      if (querySnapshot.docs.isEmpty) {
        return null; // Return null if no tenders found
      }

      final doc = querySnapshot.docs.first;

      _bidOrganModel = BidOrganModel.fromFirestore(doc);
      notifyListeners();
      return _bidOrganModel;
    } catch (error) {
      print("Error fetching tender for organ: $error");
      return null;
    }
  }

  // Add a new tender
  // Add a new tender
  Future<void> addTender({
    required String bidNumber,
    required String bidDescription,
    required List<String> keyPersonnel,
    required DateTime closingDate,
    required String adminType,
    required String organName,
    required String bidId,
  }) async {
    if (bidId.isEmpty) {
      print("Bid ID cannot be empty");
      return;
    }

    try {
      QuerySnapshot existingTender = await FirebaseFirestore.instance
          .collection('tenders')
          .where('bidNumber', isEqualTo: bidNumber)
          .get();

      if (existingTender.docs.isNotEmpty) {
        print("Tender with this bidNumber already exists.");
        return;
      }

      DocumentReference docRef = await FirebaseFirestore.instance
          .collection('tenders')
          .add({
        'bidNumber': bidNumber,
        'bidDescription': bidDescription,
        'closingDate': closingDate.toIso8601String(), // Convert DateTime to String
        'keyPersonnel': keyPersonnel,
        'adminType': adminType,
        'organName': organName,
        'bidId': bidId, // Include in Firestore
      });

      // Ensure the bidId is set correctly after document is created
      await docRef.update({'bidId': docRef.id});  // Make sure bidId is set to the document ID

      _bidOrganModel = BidOrganModel(
        id: docRef.id,
        bidNumber: bidNumber,
        bidDescription: bidDescription,
        closingDate: closingDate,
        keyPersonnel: keyPersonnel,
        adminType: adminType,
        organName: organName,
        bidId: docRef.id, // Update with correct bidId
        docId: docRef.id, // Update docId
      );

      notifyListeners();
    } catch (e) {
      print("Error adding tender: $e");
    }
  }
  // Update an existing tender
  Future<bool> updateBidOrganProfile({
    required String id,
    required String bidNumber,
    required String bidDescription,
    required DateTime closingDate,
    required List<String> keyPersonnel,
    required String adminType,
    required String organName,
    required String bidId,
  }) async {
    if (bidId.isEmpty) {
      print("Bid ID cannot be empty");
      return false;
    }

    try {
      final Map<String, dynamic> payload = {
        'bidNumber': bidNumber,
        'bidDescription': bidDescription,
        'closingDate': closingDate.toIso8601String(), // Convert DateTime to String
        'keyPersonnel': keyPersonnel,
        'adminType': adminType,
        'organName': organName,
        'bidId': bidId, // Save to Firestore
      };

      await FirebaseFirestore.instance.collection('tenders').doc(id).update(payload);

      _bidOrganModel = BidOrganModel(
        id: id,
        bidNumber: bidNumber,
        bidDescription: bidDescription,
        closingDate: closingDate,
        keyPersonnel: keyPersonnel,
        adminType: adminType,
        organName: organName,
        bidId: bidId, // Add here
        docId: id, // Ensure docId is properly updated
      );

      notifyListeners();
      return true;
    } catch (e) {
      print("Error updating tender: $e");
      return false;
    }
  }

  // Backfill missing bidId for tenders
  Future<void> backfillBidIdInTenders() async {
    try {
      final tenders = await FirebaseFirestore.instance.collection('tenders').get();

      for (var doc in tenders.docs) {
        final data = doc.data();
        final hasBidId = data.containsKey('bidId') &&
            data['bidId'] != null &&
            data['bidId'].toString().isNotEmpty;

        if (!hasBidId) {
          final fallbackBidId = data['postedBy'] ?? 'unknownbidId';

          await doc.reference.update({'bidId': fallbackBidId});
          print('🛠️ Updated tender ${doc.id} with fallback bidId: $fallbackBidId');
        }
      }

      print('✅ Backfill completed.');
    } catch (e) {
      print('❌ Error during backfill: $e');
    }
  }
}






