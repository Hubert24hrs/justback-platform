import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/providers/property_provider.dart';
import '../../core/constants/app_constants.dart';
import '../../core/widgets/glass_box.dart';
import 'dart:ui';

class PropertyDetailsScreen extends StatefulWidget {
  final String propertyId;

  const PropertyDetailsScreen({
    Key? key,
    required this.propertyId,
  }) : super(key: key);

  @override
  State<PropertyDetailsScreen> createState() => _PropertyDetailsScreenState();
}

class _PropertyDetailsScreenState extends State<PropertyDetailsScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() =>
        context.read<PropertyProvider>().fetchPropertyDetails(widget.propertyId));
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<PropertyProvider>(
      builder: (context, propertyProvider, child) {
        if (propertyProvider.isLoading) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }

        final property = propertyProvider.selectedProperty;
        if (property == null) {
          return Scaffold(
            appBar: AppBar(),
            body: Center(child: Text(propertyProvider.error ?? 'Property not found')),
          );
        }

        return Scaffold(
          body: Stack(
            children: [
              CustomScrollView(
                slivers: [
                  // Hero Image Section
                  SliverAppBar(
                    expandedHeight: 400,
                    pinned: true,
                    flexibleSpace: FlexibleSpaceBar(
                      background: Hero(
                        tag: 'prop_${property['id']}',
                        child: CachedNetworkImage(
                          imageUrl: property['imageUrl'],
                          fit: BoxFit.cover,
                          placeholder: (context, url) => Container(color: Colors.grey[900]),
                          errorWidget: (context, url, error) => const Icon(Icons.error),
                        ),
                      ),
                    ),
                    actions: [
                      IconButton(
                        icon: const Icon(Icons.favorite_border, color: Colors.white),
                        onPressed: () {},
                      ),
                      IconButton(
                        icon: const Icon(Icons.share, color: Colors.white),
                        onPressed: () {},
                      ),
                    ],
                  ),
                  // Content Section
                  SliverList(
                    delegate: SliverChildListDelegate([
                      Padding(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Text(
                                    property['title'],
                                    style: const TextStyle(
                                      fontSize: 24,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 6,
                                  ),
                                  decoration: BoxDecoration(
                                    color: AppConstants.primaryColor.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(Icons.star, size: 16, color: Colors.amber),
                                      const SizedBox(width: 4),
                                      Text(
                                        '4.9',
                                        style: TextStyle(
                                          color: AppConstants.primaryColor,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                const Icon(Icons.location_on, size: 18, color: Colors.grey),
                                const SizedBox(width: 6),
                                Text(
                                  '${property['city']}, ${property['state']}',
                                  style: const TextStyle(fontSize: 16, color: Colors.grey),
                                ),
                              ],
                            ),
                            const SizedBox(height: 24),
                            // Stats (Beds, Baths, Guests)
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceAround,
                              children: [
                                _buildStatItem(Icons.bed_outlined, '${property['bedrooms']} Beds'),
                                _buildStatItem(Icons.bathtub_outlined, '${property['bathrooms']} Baths'),
                                _buildStatItem(Icons.group_outlined, '${property['maxGuests']} Guests'),
                              ],
                            ),
                            const SizedBox(height: 32),
                            const Text(
                              'Description',
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              property['description'],
                              style: const TextStyle(
                                fontSize: 16,
                                color: Colors.white70,
                                height: 1.5,
                              ),
                            ),
                            const SizedBox(height: 32),
                            const Text(
                              'Amenities',
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 16),
                            Wrap(
                              spacing: 12,
                              runSpacing: 12,
                              children: [
                                _buildAmenityChip('WiFi', Icons.wifi),
                                _buildAmenityChip('Pool', Icons.pool),
                                _buildAmenityChip('Security', Icons.security),
                                _buildAmenityChip('Air Con', Icons.ac_unit),
                              ],
                            ),
                            const SizedBox(height: 150),
                          ],
                        ),
                      ),
                    ]),
                  ),
                ],
              ),
              
              // AI Voice Overlay
              if (propertyProvider.isAIProcessing || propertyProvider.currentCallSid != null)
                _buildAIVoiceOverlay(propertyProvider),
            ],
          ),
          backgroundColor: const Color(0xFF0A0A0B), // Dark background
          bottomSheet: Container(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
            decoration: BoxDecoration(
              color: const Color(0xFF161618),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(30)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.5),
                  blurRadius: 20,
                  offset: const Offset(0, -5),
                ),
              ],
            ),
            child: Row(
              children: [
                Expanded(
                  flex: 2,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '₦${property['basePrice']}',
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: AppConstants.neonGreen,
                        ),
                      ),
                      const Text('per night', style: TextStyle(color: Colors.grey)),
                    ],
                  ),
                ),
                // AI Concierge Button
                GestureDetector(
                  onTap: () => propertyProvider.requestAICall(property['id']),
                  child: Container(
                    height: 54,
                    width: 54,
                    margin: const EdgeInsets.only(right: 12),
                    decoration: BoxDecoration(
                      color: AppConstants.cyberBlue.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppConstants.cyberBlue.withOpacity(0.3)),
                    ),
                    child: propertyProvider.isAIProcessing 
                      ? const Padding(
                          padding: EdgeInsets.all(12.0),
                          child: CircularProgressIndicator(strokeWidth: 2, color: AppConstants.cyberBlue),
                        )
                      : const Icon(Icons.smart_toy_rounded, color: AppConstants.cyberBlue),
                  ),
                ),
                Expanded(
                  flex: 3,
                  child: SizedBox(
                    height: 54,
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.pushNamed(
                          context,
                          '/booking-summary',
                          arguments: property,
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppConstants.neonGreen,
                        foregroundColor: Colors.black,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                        elevation: 0,
                      ),
                      child: const Text(
                        'Book Now',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildAIVoiceOverlay(PropertyProvider provider) {
    return Positioned.fill(
      child: GlassBox(
        blur: 20,
        opacity: 0.8,
        borderRadius: 0,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 40),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Rotating Neon Circle Animation simulation
              Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: AppConstants.cyberBlue, width: 2),
                  boxShadow: [
                    BoxShadow(
                      color: AppConstants.cyberBlue.withOpacity(0.5),
                      blurRadius: 30,
                      spreadRadius: 5,
                    ),
                  ],
                ),
                child: const Icon(Icons.mic, color: Colors.white, size: 40),
              ),
              const SizedBox(height: 32),
              const Text(
                'AI Concierge Calling...',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: AppConstants.cyberBlue,
                  letterSpacing: 1.2,
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Simulating RAG Knowledge Retrieval',
                style: TextStyle(color: Colors.white54, fontSize: 13),
              ),
              const SizedBox(height: 48),
              if (provider.simulatedTranscript != null)
                Expanded(
                  child: ListView.builder(
                    itemCount: provider.simulatedTranscript!.length,
                    itemBuilder: (context, index) {
                      final item = provider.simulatedTranscript![index];
                      final isAI = item['speaker'] == 'ai';
                      return Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        child: Column(
                          crossAxisAlignment: isAI ? CrossAxisAlignment.start : CrossAxisAlignment.end,
                          children: [
                            Text(
                              isAI ? 'JUSTBACK AI' : 'YOU',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: isAI ? AppConstants.cyberBlue : AppConstants.neonGreen,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              item['text'],
                              textAlign: isAI ? TextAlign.left : TextAlign.right,
                              style: const TextStyle(color: Colors.white, fontSize: 15, height: 1.4),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: () => provider.clearAICall(),
                icon: const Icon(Icons.call_end),
                label: const Text('End Call'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.redAccent,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                ),
              ),
              const SizedBox(height: 100),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatItem(IconData icon, String label) {
    return Column(
      children: [
        Icon(icon, size: 28, color: AppConstants.primaryColor),
        const SizedBox(height: 8),
        Text(label, style: const TextStyle(fontWeight: FontWeight.w500)),
      ],
    );
  }

  Widget _buildAmenityChip(String label, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[300]!),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 18),
          const SizedBox(width: 8),
          Text(label),
        ],
      ),
    );
  }
}
