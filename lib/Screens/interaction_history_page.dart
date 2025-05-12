import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';

class InteractionHistoryScreen extends StatefulWidget {
  final String userId;
  final String role;

  const InteractionHistoryScreen({
    super.key,
    required this.userId,
    required this.role,
  });

  @override
  State<InteractionHistoryScreen> createState() => _InteractionHistoryScreenState();
}

class _InteractionHistoryScreenState extends State<InteractionHistoryScreen> {
  List<EnrichedRequest> allRequests = [];
  List<EnrichedRequest> filteredRequests = [];
  bool isLoading = true;

  String? selectedStatus;
  DateTime? selectedDate;
  TextEditingController searchController = TextEditingController();
  String searchTerm = '';

  @override
  void initState() {
    super.initState();
    _fetchHistory();
  }

  Future<void> _fetchHistory() async {
    setState(() => isLoading = true);

    print('🔍 Fetch history for userId=${widget.userId}, role=${widget.role}');

    try {
      final List<EnrichedRequest> enriched = [];
      late List<QueryDocumentSnapshot<Map<String, dynamic>>> requestDocs;

      final uid = widget.userId;
      final roleKey = widget.role.toLowerCase();

      final tenderSnap = await FirebaseFirestore.instance
          .collection('tenders')
          .where('postedBy', isEqualTo: uid)
          .get();

      final tenderInfoMap = {
        for (var doc in tenderSnap.docs)
          doc.id: {
            'bidNumber': doc.data()['bidNumber'],
            'closingDate': doc.data()['closingDate'],
          }
      };

      if (roleKey == 'organ') {
        final tenderIds = tenderSnap.docs.map((e) => e.id).toList();
        if (tenderIds.isEmpty) {
          setState(() {
            allRequests = [];
            filteredRequests = [];
            isLoading = false;
          });
          return;
        }

        final chunks = <List<String>>[];
        for (var i = 0; i < tenderIds.length; i += 10) {
          chunks.add(
            tenderIds.sublist(
              i,
              i + 10 > tenderIds.length ? tenderIds.length : i + 10,
            ),
          );
        }

        final allDocs = <QueryDocumentSnapshot<Map<String, dynamic>>>[];
        for (var chunk in chunks) {
          final snap = await FirebaseFirestore.instance
              .collection('requests')
              .where('bidId', whereIn: chunk)
              .get();
          allDocs.addAll(snap.docs);
        }
        requestDocs = allDocs;
      } else if (roleKey == 'company') {
        final requestSnap = await FirebaseFirestore.instance
            .collection('requests')
            .where('companyId', isEqualTo: uid)
            .get();
        requestDocs = requestSnap.docs;
      } else if (roleKey == 'personnel' || roleKey == 'user') {
        final requestSnap = await FirebaseFirestore.instance
            .collection('requests')
            .where('toUserId', isEqualTo: uid)
            .get();

        print('🔍 Found ${requestSnap.docs.length} request(s) for toUserId=$uid');
        requestDocs = requestSnap.docs;
      } else {
        requestDocs = [];
        print('⚠️ Unknown role "${widget.role}", no documents fetched.');
      }

      // 🆕 Collect all bidIds from requests
      final allBidIds = requestDocs.map((doc) => doc.data()['bidId']).whereType<String>().toSet().toList();

      if (allBidIds.isNotEmpty) {
        final bidChunks = <List<String>>[];
        for (var i = 0; i < allBidIds.length; i += 10) {
          bidChunks.add(allBidIds.sublist(
            i,
            i + 10 > allBidIds.length ? allBidIds.length : i + 10,
          ));
        }

        for (var chunk in bidChunks) {
          final tenderSnap = await FirebaseFirestore.instance
              .collection('tenders')
              .where(FieldPath.documentId, whereIn: chunk)
              .get();

          for (var doc in tenderSnap.docs) {
            tenderInfoMap[doc.id] = {
              'bidNumber': doc.data()['bidNumber'],
              'closingDate': doc.data()['closingDate'],
            };
          }
        }
      }

      for (var doc in requestDocs) {
        final data = doc.data();
        String responderName = 'Unknown';

        if (roleKey == 'organ' || roleKey == 'personnel' || roleKey == 'user') {
          final companySnap = await FirebaseFirestore.instance
              .collection('company_users')
              .doc(data['companyId'])
              .get();
          responderName = companySnap.data()?['companyName'] ?? 'Unknown';
        }

        final tenderInfo = tenderInfoMap[data['bidId']];

        if (roleKey == 'organ') {
          enriched.add(EnrichedRequest(
            id: doc.id,
            data: {
              ...data,
              'responderName': responderName,
              'personnelName': data['personnelName'] ?? 'Unknown',
              'qualification': data['qualification'] ?? 'Unknown',
              'bidNumber': tenderInfo?['bidNumber'] ?? 'No bid number',
              'closingDate': tenderInfo?['closingDate'] ?? 'No closing date',
            },
          ));
        } else if (roleKey == 'personnel' || roleKey == 'user') {
          String organName = 'Unknown';
          if (data['organId'] != null) {
            final organSnap = await FirebaseFirestore.instance
                .collection('organs')
                .doc(data['organId'])
                .get();
            organName = organSnap.data()?['organName'] ?? 'Unknown';
          }

          enriched.add(EnrichedRequest(
            id: doc.id,
            data: {
              ...data,
              'responderName': responderName,
              'organName': organName,
              'personnelName': data['personnelName'] ?? 'Unknown',
              'qualification': data['qualification'] ?? 'Unknown',
              'bidDescription': data['bidDescription'] ?? 'No description',
              'bidNumber': tenderInfo?['bidNumber'] ?? 'No bid number',
              'closingDate': tenderInfo?['closingDate'] ?? 'No closing date',
            },
          ));
        } else if (roleKey == 'company') {
          enriched.add(EnrichedRequest(
            id: doc.id,
            data: {
              ...data,
              'personnelName': data['personnelName'] ?? 'Unknown',
              'qualification': data['qualification'] ?? 'Unknown',
              'bidNumber': tenderInfo?['bidNumber'] ?? 'No bid number',
              'closingDate': tenderInfo?['closingDate'] ?? 'No closing date',
            },
          ));
        }
      }

      setState(() {
        allRequests = enriched;
        filteredRequests = List.from(allRequests);
        isLoading = false;
      });
    } catch (e) {
      setState(() => isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Error fetching history: $e")),
        );
      }
    }
  }

  void _applyFilters() {
    setState(() {
      filteredRequests = allRequests.where((req) {
        final data = req.data;
        final status = data['status']?.toString().toLowerCase();
        final timestamp = data['timestamp'];
        final companyName = data['responderName']?.toString().toLowerCase();

        final statusMatch = selectedStatus == null || status == selectedStatus!.toLowerCase();
        final dateMatch = selectedDate == null ||
            (timestamp is Timestamp && _isSameDay(timestamp.toDate(), selectedDate!));
        final searchMatch = searchTerm.isEmpty || (companyName?.contains(searchTerm) ?? false);

        return statusMatch && dateMatch && searchMatch;
      }).toList();
    });
  }

  bool _isSameDay(DateTime a, DateTime b) =>
      a.year == b.year && a.month == b.month && a.day == b.day;

  void _clearFilters() {
    setState(() {
      selectedStatus = null;
      selectedDate = null;
      searchTerm = '';
      filteredRequests = List.from(allRequests);
    });
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: selectedDate ?? DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
    );

    if (picked != null) {
      setState(() => selectedDate = picked);
      _applyFilters();
    }
  }

  @override
  Widget build(BuildContext context) {
    final roleKey = widget.role.toLowerCase();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Interaction History'),
        actions: [
          IconButton(
            icon: const Icon(Icons.download),
            tooltip: 'Export Approved Requests',
            onPressed: _exportApprovedRequestsAsPDF,
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                DropdownButton<String>(
                  hint: const Text('Filter by status'),
                  value: selectedStatus,
                  items: ['Pending', 'Approved', 'Declined']
                      .map((status) => DropdownMenuItem(
                    value: status,
                    child: Text(status),
                  ))
                      .toList(),
                  onChanged: (value) {
                    setState(() => selectedStatus = value);
                    _applyFilters();
                  },
                ),
                ElevatedButton(
                  onPressed: _pickDate,
                  child: Text(selectedDate == null
                      ? 'Filter by date'
                      : 'Date: ${selectedDate!.toLocal().toString().split(' ')[0]}'),
                ),
                TextButton(
                  onPressed: _clearFilters,
                  child: const Text('Clear Filters'),
                ),
                if (roleKey != 'company')
                  SizedBox(
                    width: 200,
                    child: TextField(
                      controller: searchController,
                      decoration: const InputDecoration(
                        labelText: 'Search by company',
                        border: OutlineInputBorder(),
                      ),
                      onChanged: (value) {
                        setState(() => searchTerm = value.trim().toLowerCase());
                        _applyFilters();
                      },
                    ),
                  ),
              ],
            ),
          ),
          Expanded(
            child: isLoading
                ? const Center(child: CircularProgressIndicator())
                : filteredRequests.isEmpty
                ? const Center(child: Text('No interaction history found.'))
                : ListView.builder(
              itemCount: filteredRequests.length,
              itemBuilder: (context, index) {
                final data = filteredRequests[index].data;

                return Card(
                  margin: const EdgeInsets.all(12),
                  elevation: 4,
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildDetail('Bid Number', data['bidNumber']),
                        _buildDetail(
                          'Closing Date',
                          data['closingDate'] is Timestamp
                              ? _formatDate((data['closingDate'] as Timestamp).toDate())
                              : data['closingDate'],
                        ),
                        if (roleKey == 'organ' || roleKey == 'personnel')
                          _buildDetail('Company Requested Access', data['responderName']),
                        if (roleKey == 'organ' || roleKey == 'company')
                          _buildDetail('Personnel Name', data['personnelName']),
                        if (roleKey == 'organ' || roleKey == 'company')
                          _buildDetail('Qualification', data['qualification']),
                        if (roleKey == 'organ')
                          _buildDetail('Request Details', data['bidDescription']),
                        _buildDetail('Status', data['status']),
                        _buildDetail(
                          'Response Date',
                          data['timestamp'] is Timestamp
                              ? _formatDate((data['timestamp'] as Timestamp).toDate())
                              : 'No response date available',
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _exportApprovedRequestsAsPDF() async {
    final pdfDoc = pw.Document();

    final approved = filteredRequests
        .where((req) => req.data['status']?.toString().toLowerCase() == 'approved')
        .toList();

    if (approved.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No approved requests to export.')),
      );
      return;
    }

    final Map<String, List<EnrichedRequest>> grouped = {};
    for (var req in approved) {
      final data = req.data;
      final companyId = data['companyId'];
      final bidId = data['bidId'];
      final key = '$companyId|$bidId';

      if (!grouped.containsKey(key)) {
        grouped[key] = [];
      }
      grouped[key]!.add(req);
    }

    pdfDoc.addPage(
      pw.MultiPage(
        build: (_) => [
          pw.Text('Grouped Approved Requests Report',
              style: pw.TextStyle(fontSize: 20, fontWeight: pw.FontWeight.bold)),
          pw.SizedBox(height: 20),
          ...grouped.entries.map((entry) {
            final group = entry.value;
            final first = group.first.data;

            return pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Text('Bid Number: ${first['bidNumber'] ?? 'N/A'}'),
                pw.Text('Company: ${first['responderName'] ?? 'N/A'}'),
                pw.Text('Closing Date: ${first['closingDate'] is Timestamp ? _formatDate((first['closingDate'] as Timestamp).toDate()) : 'N/A'}'),
                pw.SizedBox(height: 8),
                pw.Text('Personnel List:', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                ...group.map((req) {
                  final d = req.data;
                  return pw.Bullet(
                    text: '${d['personnelName'] ?? 'N/A'} — ${d['qualification'] ?? 'N/A'}',
                  );
                }),
                pw.SizedBox(height: 8),
                pw.Text('Status: Approved'),
                pw.Text('Response Dates:'),
                ...group.map((req) {
                  final ts = req.data['timestamp'];
                  return pw.Bullet(
                    text: ts is Timestamp ? _formatDate(ts.toDate()) : 'N/A',
                  );
                }),
                pw.Divider(),
                pw.SizedBox(height: 10),
              ],
            );
          }).toList(),
        ],
      ),
    );

    await Printing.layoutPdf(onLayout: (PdfPageFormat format) async => pdfDoc.save());
  }


  Widget _buildDetail(String title, String? value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 3,
            child: Text('$title:', style: const TextStyle(fontWeight: FontWeight.bold)),
          ),
          Expanded(
            flex: 5,
            child: Text((value?.isNotEmpty ?? false) ? value! : 'No details available'),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')} '
        '${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
  }
}

class EnrichedRequest {
  final String id;
  final Map<String, dynamic> data;

  EnrichedRequest({required this.id, required this.data});
}






























