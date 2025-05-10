class InteractionRequest {
  final String id;
  final String userId;
  final String companyId;
  final String bidId;
  final String bidDescription;
  final String bidNumber;
  final DateTime requestDate;
  final DateTime? feedbackDate;
  final bool isApproved;
  final bool isDeclined;
  final String responderName;

  InteractionRequest({
    required this.id,
    required this.userId,
    required this.companyId,
    required this.bidId,
    required this.bidDescription,
    required this.bidNumber,
    required this.requestDate,
    this.feedbackDate,
    this.responderName = 'Unknown',
    this.isApproved = false,
    this.isDeclined = false,
  }) {
    if (isApproved && isDeclined) {
      throw ArgumentError(
        'A request cannot be both approved and declined at the same time.',
      );
    }
  }

  InteractionRequest copyWith({
    String? id,
    String? userId,
    String? companyId,
    String? bidId,
    String? bidDescription,
    String? bidNumber,
    DateTime? requestDate,
    DateTime? feedbackDate,
    bool? isApproved,
    bool? isDeclined,
    String? responderName,
  }) {
    final newIsApproved = isApproved ?? this.isApproved;
    final newIsDeclined = isDeclined ?? this.isDeclined;

    if (newIsApproved && newIsDeclined) {
      throw ArgumentError(
        'A request cannot be both approved and declined at the same time.',
      );
    }

    return InteractionRequest(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      companyId: companyId ?? this.companyId,
      bidId: bidId ?? this.bidId,
      bidDescription: bidDescription ?? this.bidDescription,
      bidNumber: bidNumber ?? this.bidNumber,
      requestDate: requestDate ?? this.requestDate,
      feedbackDate: feedbackDate ?? this.feedbackDate,
      isApproved: newIsApproved,
      isDeclined: newIsDeclined,
      responderName: responderName ?? this.responderName,

    );
  }
}



