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
            backgroundColor: Color(0xFF03050C),
            body: Center(child: CircularProgressIndicator(color: AppConstants.primaryColor)),
          );
        }

        final property = propertyProvider.selectedProperty;
        if (property == null) {
          return Scaffold(
            backgroundColor: const Color(0xFF03050C),
            appBar: AppBar(backgroundColor: Colors.transparent, elevation: 0),
            body: Center(child: Text(propertyProvider.error ?? 'Property not found', style: const TextStyle(color: Colors.white))),
          );
        }

        return Scaffold(
          backgroundColor: const Color(0xFF03050C),
          body: Stack(
            children: [
              CustomScrollView(
                slivers: [
                  // Hero Image Section
                  SliverAppBar(
                    expandedHeight: 420,
                    pinned: true,
                    backgroundColor: const Color(0xFF03050C),
                    leading: Container(
                      margin: const EdgeInsets.all(8),
                      decoration: const BoxDecoration(
                        color: Colors.black26, 
                        shape: BoxShape.circle,
                      ),
                      child: IconButton(
                        icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 20),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ),
                    flexibleSpace: FlexibleSpaceBar(
                      background: Stack(
                        fit: StackFit.expand,
                        children: [
                          Hero(
                            tag: 'prop_${property['id']}',
                            child: CachedNetworkImage(
                              imageUrl: property['imageUrl'],
                              fit: BoxFit.cover,
                              errorWidget: (context, url, error) => Container(color: Colors.grey[900]),
                            ),
                          ),
                          // Gradient Overlay
                          Container(
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                                colors: [
                                  Colors.transparent,
                                  const Color(0xFF03050C).withOpacity(0.2),
                                  const Color(0xFF03050C),
                                ],
                                stops: const [0.6, 0.8, 1.0],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    actions: [
                      _buildAppBarAction(Icons.favorite_border_rounded),
                      _buildAppBarAction(Icons.share_rounded),
                      const SizedBox(width: 8),
                    ],
                  ),
                  
                  // Content Section
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Title & Rating
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(
                                child: Text(
                                  property['title'],
                                  style: const TextStyle(
                                    fontSize: 26,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                    height: 1.2,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 16),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                decoration: BoxDecoration(
                                  color: AppConstants.neonGreen.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: AppConstants.neonGreen.withOpacity(0.3)),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(Icons.star_rounded, size: 18, color: AppConstants.neonGreen),
                                    const SizedBox(width: 4),
                                    const Text(
                                      '4.9',
                                      style: TextStyle(
                                        color: AppConstants.neonGreen,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 16,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          
                          // Location
                          Row(
                            children: [
                              const Icon(Icons.location_on_rounded, size: 18, color: Colors.white54),
                              const SizedBox(width: 6),
                              Text(
                                '${property['city']}, ${property['state']}',
                                style: const TextStyle(fontSize: 16, color: Colors.white54),
                              ),
                            ],
                          ),
                          
                          const SizedBox(height: 32),
                          
                          // Stats (Glass Cards)
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              _buildStatItem(Icons.bed_rounded, '${property['bedrooms']} Beds'),
                              _buildStatItem(Icons.bathtub_rounded, '${property['bathrooms']} Baths'),
                              _buildStatItem(Icons.group_rounded, '${property['maxGuests']} Guests'),
                            ],
                          ),
                          
                          const SizedBox(height: 32),
                          
                          // Description
                          const Text(
                            'About this place',
                            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                          const SizedBox(height: 12),
                          Text(
                            property['description'],
                            style: const TextStyle(fontSize: 16, color: Colors.white70, height: 1.6),
                          ),
                          
                          const SizedBox(height: 32),
                          
                          // Amenities
                          const Text(
                            'What matches your vibe',
                            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                          const SizedBox(height: 16),
                          Wrap(
                            spacing: 12,
                            runSpacing: 12,
                            children: [
                              _buildAmenityChip('Fast WiFi', Icons.wifi_rounded),
                              _buildAmenityChip('Pool', Icons.pool_rounded),
                              _buildAmenityChip('Smart Home', Icons.home_filled),
                              _buildAmenityChip('AC', Icons.ac_unit_rounded),
                              _buildAmenityChip('Gym', Icons.fitness_center_rounded),
                            ],
                          ),
                          
                          const SizedBox(height: 120), // Bottom padding for floating bar
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              
              // Bottom Action Bar
              Positioned(
                left: 0,
                right: 0,
                bottom: 0,
                child: GlassBox(
                  borderRadius: 0,
                  opacity: 0.8,
                  child: Container(
                    padding: const EdgeInsets.only(left: 24, right: 24, top: 20, bottom: 32),
                    decoration: BoxDecoration(
                      border: Border(top: BorderSide(color: Colors.white.withOpacity(0.1))),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          flex: 2,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text(
                                    '₦${property['basePrice']}',
                                    style: const TextStyle(
                                      fontSize: 24,
                                      fontWeight: FontWeight.bold,
                                      color: AppConstants.neonGreen,
                                    ),
                                  ),
                                  const SizedBox(width: 4),
                                  const Padding(
                                    padding: EdgeInsets.only(bottom: 4),
                                    child: Text('/night', style: TextStyle(color: Colors.white54)),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              const Text('Aug 12 - 17', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w500)),
                            ],
                          ),
                        ),
                        
                        // AI Concierge Button
                        GestureDetector(
                          onTap: () => propertyProvider.requestAICall(property['id']),
                          child: Container(
                            height: 56,
                            width: 56,
                            margin: const EdgeInsets.only(right: 12),
                            decoration: BoxDecoration(
                              color: AppConstants.cyberBlue.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: AppConstants.cyberBlue.withOpacity(0.5)),
                              boxShadow: [
                                BoxShadow(
                                  color: AppConstants.cyberBlue.withOpacity(0.2),
                                  blurRadius: 10,
                                  spreadRadius: 2,
                                )
                              ],
                            ),
                            child: propertyProvider.isAIProcessing 
                              ? const Padding(
                                  padding: EdgeInsets.all(14.0),
                                  child: CircularProgressIndicator(strokeWidth: 2, color: AppConstants.cyberBlue),
                                )
                              : const Icon(Icons.smart_toy_rounded, color: AppConstants.cyberBlue),
                          ),
                        ),
                        
                        // Book Button
                        Expanded(
                          flex: 3,
                          child: ElevatedButton(
                            onPressed: () {
                              Navigator.pushNamed(
                                context,
                                '/booking-summary',
                                arguments: property,
                              );
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppConstants.primaryColor,
                              foregroundColor: Colors.black,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                              ),
                              shadowColor: AppConstants.primaryColor.withOpacity(0.4),
                              elevation: 8,
                            ),
                            child: const Text('Book Now', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, letterSpacing: 1)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              // AI Voice Overlay
              if (propertyProvider.isAIProcessing || propertyProvider.currentCallSid != null)
                _buildAIVoiceOverlay(propertyProvider),
            ],
          ),
        );
      },
    );
  }

  Widget _buildAppBarAction(IconData icon) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 4),
      decoration: const BoxDecoration(
        color: Colors.black26,
        shape: BoxShape.circle,
      ),
      child: IconButton(
        icon: Icon(icon, color: Colors.white, size: 20),
        onPressed: () {},
      ),
    );
  }

  Widget _buildStatItem(IconData icon, String label) {
    return GlassBox(
      opacity: 0.05,
      borderRadius: 16,
      child: Container(
        width: 100,
        padding: const EdgeInsets.symmetric(vertical: 16),
        child: Column(
          children: [
            Icon(icon, size: 28, color: Colors.white),
            const SizedBox(height: 8),
            Text(label, style: const TextStyle(fontWeight: FontWeight.w500, color: Colors.white70, fontSize: 13)),
          ],
        ),
      ),
    );
  }

  Widget _buildAmenityChip(String label, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 18, color: Colors.white70),
          const SizedBox(width: 8),
          Text(label, style: const TextStyle(color: Colors.white)),
        ],
      ),
    );
  }

  Widget _buildAIVoiceOverlay(PropertyProvider provider) {
    return Positioned.fill(
      child: GlassBox(
        blur: 20,
        opacity: 0.9,
        borderRadius: 0,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 40),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Rotating Neon Circle
              Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: AppConstants.cyberBlue, width: 2),
                  boxShadow: [
                    BoxShadow(
                      color: AppConstants.cyberBlue.withOpacity(0.4),
                      blurRadius: 40,
                      spreadRadius: 10,
                    ),
                  ],
                ),
                child: const Icon(Icons.mic_rounded, color: Colors.white, size: 50),
              ),
              const SizedBox(height: 48),
              const Text(
                'AI Concierge Active',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: AppConstants.cyberBlue,
                  letterSpacing: 1.5,
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Discussing amenities and rules...',
                style: TextStyle(color: Colors.white54, fontSize: 14),
              ),
              const SizedBox(height: 48),
              if (provider.simulatedTranscript != null)
                Container(
                  height: 200,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.black45,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.white10),
                  ),
                  child: ListView.builder(
                    itemCount: provider.simulatedTranscript!.length,
                    itemBuilder: (context, index) {
                      final item = provider.simulatedTranscript![index];
                      final isAI = item['speaker'] == 'ai';
                      return Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: isAI ? MainAxisAlignment.start : MainAxisAlignment.end,
                          children: [
                            if (isAI) 
                              const Icon(Icons.smart_toy, size: 16, color: AppConstants.cyberBlue),
                            const SizedBox(width: 8),
                            Flexible(
                              child: Text(
                                item['text'],
                                style: TextStyle(
                                  color: isAI ? AppConstants.cyberBlue : AppConstants.neonGreen, 
                                  fontSize: 14
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: () => provider.clearAICall(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.redAccent.withOpacity(0.2),
                  foregroundColor: Colors.redAccent,
                  padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30), side: const BorderSide(color: Colors.redAccent)),
                ),
                child: const Text('End Call', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
