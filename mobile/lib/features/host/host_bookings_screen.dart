import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/providers/host_provider.dart';
import '../../core/constants/app_constants.dart';
import '../../core/widgets/glass_box.dart';

class HostBookingsScreen extends StatefulWidget {
  const HostBookingsScreen({super.key});

  @override
  State<HostBookingsScreen> createState() => _HostBookingsScreenState();
}

class _HostBookingsScreenState extends State<HostBookingsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  
  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    Future.microtask(() {
      if (mounted) context.read<HostProvider>().fetchHostBookings();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF03050C),
      appBar: AppBar(
        title: const Text('My Bookings', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(50),
          child: TabBar(
            controller: _tabController,
            isScrollable: true,
            indicatorColor: AppConstants.primaryColor,
            indicatorWeight: 3,
            labelColor: AppConstants.primaryColor,
            unselectedLabelColor: Colors.white54,
            labelStyle: const TextStyle(fontWeight: FontWeight.bold),
            tabs: const [
              Tab(text: 'Pending'),
              Tab(text: 'Confirmed'),
              Tab(text: 'Checked In'),
              Tab(text: 'Completed'),
            ],
          ),
        ),
      ),
      body: Consumer<HostProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator(color: AppConstants.primaryColor));
          }

          return TabBarView(
            controller: _tabController,
            children: [
              _buildBookingsList(provider.hostBookings.where((b) => b['status'] == 'pending').toList()),
              _buildBookingsList(provider.hostBookings.where((b) => b['status'] == 'confirmed').toList()),
              _buildBookingsList(provider.hostBookings.where((b) => b['status'] == 'checked_in').toList()),
              _buildBookingsList(provider.hostBookings.where((b) => b['status'] == 'completed').toList()),
            ],
          );
        },
      ),
    );
  }

  Widget _buildBookingsList(List<dynamic> bookings) {
    if (bookings.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.bookmark_border_rounded, size: 64, color: Colors.white.withValues(alpha: 0.2)),
            const SizedBox(height: 16),
            const Text('No bookings here', style: TextStyle(color: Colors.white54, fontSize: 16)),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(20),
      itemCount: bookings.length,
      itemBuilder: (context, index) => _buildBookingCard(bookings[index]),
    );
  }

  Widget _buildBookingCard(Map<String, dynamic> booking) {
    final statusColor = _getStatusColor(booking['status']);

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        color: const Color(0xFF0F111A),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: Column(
        children: [
          // Header with property image
          Container(
            height: 120,
            decoration: BoxDecoration(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
              image: DecorationImage(
                image: NetworkImage(booking['propertyImage'] ?? 'https://picsum.photos/400/200'),
                fit: BoxFit.cover,
              ),
            ),
            child: Stack(
              children: [
                Container(
                  decoration: BoxDecoration(
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [Colors.transparent, Colors.black.withValues(alpha: 0.7)],
                    ),
                  ),
                ),
                Positioned(
                  bottom: 12,
                  left: 16,
                  right: 16,
                  child: Text(
                    booking['propertyTitle'] ?? 'Property',
                    style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Positioned(
                  top: 12,
                  right: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: statusColor.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: statusColor),
                    ),
                    child: Text(
                      (booking['status'] ?? 'pending').toString().toUpperCase(),
                      style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Guest Info & Dates
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      radius: 20,
                      backgroundColor: AppConstants.primaryColor.withValues(alpha: 0.2),
                      child: Text(
                        (booking['guestName'] ?? 'G')[0].toUpperCase(),
                        style: const TextStyle(color: AppConstants.primaryColor, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            booking['guestName'] ?? 'Guest',
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
                          ),
                          Text(
                            '${booking['guests'] ?? 1} guest(s)',
                            style: const TextStyle(color: Colors.white54, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                    Text(
                      '₦${booking['totalPrice'] ?? 0}',
                      style: const TextStyle(color: AppConstants.primaryColor, fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    _buildDateChip(Icons.login_rounded, 'Check In', booking['checkIn'] ?? 'TBD'),
                    const SizedBox(width: 12),
                    _buildDateChip(Icons.logout_rounded, 'Check Out', booking['checkOut'] ?? 'TBD'),
                  ],
                ),
                if (booking['status'] == 'pending') ...[
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => _declineBooking(booking['id']),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.redAccent,
                            side: const BorderSide(color: Colors.redAccent),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          child: const Text('Decline'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () => _acceptBooking(booking['id']),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppConstants.primaryColor,
                            foregroundColor: Colors.black,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          child: const Text('Accept', style: TextStyle(fontWeight: FontWeight.bold)),
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDateChip(IconData icon, String label, String date) {
    return Expanded(
      child: GlassBox(
        opacity: 0.05,
        borderRadius: 12,
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              Icon(icon, color: AppConstants.primaryColor, size: 18),
              const SizedBox(width: 8),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: const TextStyle(color: Colors.white54, fontSize: 10)),
                  Text(date, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _getStatusColor(String? status) {
    switch (status) {
      case 'pending':
        return Colors.orangeAccent;
      case 'confirmed':
        return AppConstants.primaryColor;
      case 'checked_in':
        return AppConstants.cyberBlue;
      case 'completed':
        return Colors.purpleAccent;
      case 'cancelled':
        return Colors.redAccent;
      default:
        return Colors.grey;
    }
  }

  void _acceptBooking(String? bookingId) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Booking accepted!'),
        backgroundColor: AppConstants.primaryColor,
      ),
    );
  }

  void _declineBooking(String? bookingId) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1A1D2D),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Decline Booking?', style: TextStyle(color: Colors.white)),
        content: const Text(
          'Are you sure you want to decline this booking? The guest will be notified.',
          style: TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(color: Colors.white54)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Booking declined'), backgroundColor: Colors.redAccent),
              );
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
            child: const Text('Decline'),
          ),
        ],
      ),
    );
  }
}
