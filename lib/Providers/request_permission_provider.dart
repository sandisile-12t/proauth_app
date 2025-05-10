import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import '../Models/permission_request.dart';

class RequestPermissionProvider with ChangeNotifier {
  bool _isLoading = false;
  String? _errorMessage;

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // Optional: A success callback for UI feedback
  Function? onSuccess;

  Future<void> submitRequest(PermissionRequest request) async {
    _setLoading(true);

    try {
      _errorMessage = null;

      // Generate a unique ID and prepare the data
      final docRef = FirebaseFirestore.instance.collection('permission_requests').doc();
      final requestWithId = request.copyWith(id: docRef.id);

      print('Submitting request with ID: ${requestWithId.id}');

      await docRef.set(requestWithId.toMap());

      print('Request successfully submitted!');

      if (onSuccess != null) onSuccess!();
    } catch (e, stackTrace) {
      _errorMessage = 'Failed to submit request: $e';
      print('Error submitting request: $e');
      print('StackTrace: $stackTrace'); // optional: useful for debugging
    } finally {
      _setLoading(false);
    }
  }

  void resetErrorMessage() {
    _errorMessage = null;
    notifyListeners();
  }

  // Cleaner loading state handler
  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }
}





