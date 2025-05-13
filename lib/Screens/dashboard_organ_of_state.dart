import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:provider/provider.dart';
import 'package:proauth/Models/bid_organ_model.dart';
import 'package:proauth/Models/organ_model.dart';
import 'package:proauth/Providers/organ_of_state_provider.dart';

class DashboardOrganOfState extends StatefulWidget {
  final BidOrganModel? bidOrganModel;
  final OrganModel? organModel;

  const DashboardOrganOfState({
    super.key,
    this.bidOrganModel,
    this.organModel,
  });

  @override
  State<DashboardOrganOfState> createState() => _DashboardOrganOfStateState();
}

class _DashboardOrganOfStateState extends State<DashboardOrganOfState> {
  bool _hasUploaded = false;
  bool _isLoading = true;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _uploadOrganIfNeeded();
  }

  Future<void> _uploadOrganIfNeeded() async {
    if (widget.organModel != null && !_hasUploaded) {
      final organ = widget.organModel!;
      final existing = await FirebaseFirestore.instance
          .collection('organs')
          .where('email', isEqualTo: organ.email)
          .limit(1)
          .get();

      if (existing.docs.isEmpty) {
        final docRef = await FirebaseFirestore.instance
            .collection('organs')
            .add(organ.toMap());

        // Use the setOrganUser method from OrganProvider
        Provider.of<OrganProvider>(context, listen: false).setOrganUser(
          organ.copyWith(id: docRef.id),
        );

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Welcome! Your profile has been created.')),
        );
      }

      setState(() {
        _hasUploaded = true;
        _isLoading = false;
      });
    } else {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final currentOrgan = Provider.of<OrganProvider>(context).currentOrgan;

    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (currentOrgan == null) {
      return const Scaffold(
        body: Center(child: Text('Please log in to access this page.')),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          "Organ Dashboard",
          style: TextStyle(color: Colors.white),
        ),
        backgroundColor: Colors.black87,
        iconTheme: const IconThemeData(color: Colors.white), // <-- Hamburger menu icon in white
        actions: [
          IconButton(
            icon: const Icon(Icons.account_circle, color: Colors.white),
            onPressed: () {
              Navigator.pushNamed(
                context,
                '/organProfile',
                arguments: currentOrgan,
              );
            },
          ),
        ],
      ),
      drawer: _buildDrawer(context, currentOrgan),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            _buildUserCard(currentOrgan),
            const SizedBox(height: 16),
            Expanded(child: _buildDashboardGrid(context, currentOrgan)),
          ],
        ),
      ),
    );
  }

  Widget _buildUserCard(OrganModel organ) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      color: Colors.black87,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            const Icon(Icons.account_circle, size: 48, color: Colors.white),
            const SizedBox(width: 16),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(organ.name, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text(organ.email ?? '', style: const TextStyle(color: Colors.white70)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDashboardGrid(BuildContext context, OrganModel organ) {
    final List<_DashboardItem> items = [
      _DashboardItem('Post Tender', Icons.add_circle_outline, () {
        Navigator.pushNamed(context, '/postTender');
      }),
      _DashboardItem('Tender History', Icons.history, () {
        Navigator.pushNamed(context, '/tenderHistory');
      }),
      _DashboardItem('Profile', Icons.account_box, () {
        Navigator.pushNamed(context, '/organProfile', arguments: organ);
      }),
      _DashboardItem('Interaction History', Icons.chat_bubble_outline, () {
        Navigator.pushNamed(
          context,
          '/interaction_history',
          arguments: {
            'userId': organ.id ?? '',
            'role': 'organ',
          },
        );
      }),
      _DashboardItem('Logout', Icons.logout, () {
        Provider.of<OrganProvider>(context, listen: false).logout();
        Navigator.pushReplacementNamed(context, '/login/organ');
      }),
    ];

    return GridView.count(
      crossAxisCount: 2,
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      children: items.map((item) => _buildGridItem(item)).toList(),
    );
  }

  Widget _buildGridItem(_DashboardItem item) {
    return GestureDetector(
      onTap: item.onTap,
      child: Card(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        color: Colors.grey[900],
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(item.icon, size: 36, color: Colors.white),
              const SizedBox(height: 12),
              Text(item.label, style: const TextStyle(color: Colors.white)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDrawer(BuildContext context, OrganModel organ) {
    return Drawer(
      child: Container(
        color: Colors.black87,
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            UserAccountsDrawerHeader(
              decoration: const BoxDecoration(color: Colors.black87),
              accountName: Text(organ.name, style: const TextStyle(color: Colors.white)),
              accountEmail: Text(organ.email ?? '', style: const TextStyle(color: Colors.white70)),
              currentAccountPicture: const CircleAvatar(
                backgroundColor: Colors.white24,
                child: Icon(Icons.account_circle, size: 42, color: Colors.white),
              ),
            ),
            _drawerItem(context, Icons.account_box, 'Profile', () {
              Navigator.pushNamed(context, '/organProfile', arguments: organ);
            }),
            _drawerItem(context, Icons.add_circle_outline, 'Post Tender', () {
              Navigator.pushNamed(context, '/postTender');
            }),
            _drawerItem(context, Icons.history, 'Tender History', () {
              Navigator.pushNamed(context, '/tenderHistory');
            }),
            _drawerItem(context, Icons.chat_bubble_outline, 'Interaction History', () {
              Navigator.pushNamed(
                context,
                '/interaction_history',
                arguments: {
                  'userId': organ.id ?? '',
                  'role': 'organ',
                },
              );
            }),
            const Divider(color: Colors.white38),
            _drawerItem(context, Icons.logout, 'Logout', () {
              Provider.of<OrganProvider>(context, listen: false).logout();
              Navigator.pushReplacementNamed(context, '/login/organ');
            }),
          ],
        ),
      ),
    );
  }

  Widget _drawerItem(BuildContext context, IconData icon, String title, VoidCallback onTap) {
    return ListTile(
      leading: Icon(icon, color: Colors.white),
      title: Text(title, style: const TextStyle(color: Colors.white)),
      onTap: onTap,
    );
  }
}

class _DashboardItem {
  final String label;
  final IconData icon;
  final VoidCallback onTap;

  _DashboardItem(this.label, this.icon, this.onTap);
}












































