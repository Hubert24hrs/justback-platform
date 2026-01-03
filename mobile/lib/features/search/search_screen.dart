import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_constants.dart';
import '../../core/providers/property_provider.dart';

/// Advanced search screen with filters
class SearchScreen extends StatefulWidget {
  final String? initialQuery;
  final String? initialCategory;

  const SearchScreen({
    super.key,
    this.initialQuery,
    this.initialCategory,
  });

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  String? _selectedCity;
  String? _selectedCategory;
  RangeValues _priceRange = const RangeValues(10000, 500000);
  int _minBedrooms = 1;
  List<String> _selectedAmenities = [];
  String _sortBy = 'rating';
  bool _showFilters = false;

  final List<String> _cities = [
    'Lagos',
    'Abuja',
    'Port Harcourt',
    'Ibadan',
    'Kano',
    'Enugu',
    'Calabar',
  ];

  final List<String> _categories = [
    'apartment',
    'hotel',
    'shortlet',
    'nightlife',
  ];

  final List<String> _amenities = [
    'wifi',
    'ac',
    'pool',
    'gym',
    'parking',
    'generator',
    'security',
    'kitchen',
  ];

  final List<Map<String, dynamic>> _sortOptions = [
    {'value': 'rating', 'label': 'Top Rated'},
    {'value': 'price_low', 'label': 'Price: Low to High'},
    {'value': 'price_high', 'label': 'Price: High to Low'},
    {'value': 'newest', 'label': 'Newest First'},
  ];

  @override
  void initState() {
    super.initState();
    _searchController.text = widget.initialQuery ?? '';
    _selectedCategory = widget.initialCategory;
    _performSearch();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _performSearch() {
    final propertyProvider = Provider.of<PropertyProvider>(context, listen: false);
    propertyProvider.searchProperties(
      city: _selectedCity,
      category: _selectedCategory,
      minPrice: _priceRange.start.toInt(),
      maxPrice: _priceRange.end.toInt(),
      minBedrooms: _minBedrooms,
      query: _searchController.text.isNotEmpty ? _searchController.text : null,
    );
  }

  List<Map<String, dynamic>> _sortResults(List<dynamic> properties) {
    final sorted = properties.map((p) => p as Map<String, dynamic>).toList();
    
    switch (_sortBy) {
      case 'price_low':
        sorted.sort((a, b) => (a['pricePerNight'] ?? 0).compareTo(b['pricePerNight'] ?? 0));
        break;
      case 'price_high':
        sorted.sort((a, b) => (b['pricePerNight'] ?? 0).compareTo(a['pricePerNight'] ?? 0));
        break;
      case 'newest':
        sorted.sort((a, b) => (b['createdAt'] ?? '').compareTo(a['createdAt'] ?? ''));
        break;
      case 'rating':
      default:
        sorted.sort((a, b) => (b['rating'] ?? 0).compareTo(a['rating'] ?? 0));
    }
    
    return sorted;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
        title: Container(
          height: 44,
          decoration: BoxDecoration(
            color: Colors.grey[100],
            borderRadius: BorderRadius.circular(22),
          ),
          child: TextField(
            controller: _searchController,
            decoration: InputDecoration(
              hintText: 'Search properties...',
              hintStyle: TextStyle(color: Colors.grey[500], fontSize: 14),
              prefixIcon: Icon(Icons.search, color: Colors.grey[500], size: 20),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            ),
            onSubmitted: (_) => _performSearch(),
          ),
        ),
        actions: [
          IconButton(
            icon: Icon(
              _showFilters ? Icons.filter_list_off : Icons.filter_list,
              color: _showFilters ? AppConstants.primaryColor : Colors.black,
            ),
            onPressed: () {
              setState(() {
                _showFilters = !_showFilters;
              });
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Filters panel
          if (_showFilters) _buildFiltersPanel(),

          // Category chips
          _buildCategoryChips(),

          // Sort bar
          _buildSortBar(),

          // Results
          Expanded(
            child: Consumer<PropertyProvider>(
              builder: (context, provider, _) {
                if (provider.isLoading) {
                  return const Center(child: CircularProgressIndicator());
                }

                final sortedProperties = _sortResults(provider.searchResults);

                if (sortedProperties.isEmpty) {
                  return _buildEmptyState();
                }

                return ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: sortedProperties.length,
                  itemBuilder: (context, index) {
                    return _buildPropertyCard(sortedProperties[index]);
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFiltersPanel() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // City dropdown
          const Text('City', style: TextStyle(fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey[300]!),
              borderRadius: BorderRadius.circular(8),
            ),
            child: DropdownButton<String>(
              value: _selectedCity,
              hint: const Text('All cities'),
              isExpanded: true,
              underline: const SizedBox(),
              items: [
                const DropdownMenuItem(value: null, child: Text('All cities')),
                ..._cities.map((city) => DropdownMenuItem(value: city, child: Text(city))),
              ],
              onChanged: (value) {
                setState(() {
                  _selectedCity = value;
                });
                _performSearch();
              },
            ),
          ),

          const SizedBox(height: 16),

          // Price range
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Price Range', style: TextStyle(fontWeight: FontWeight.w600)),
              Text(
                '₦${_formatPrice(_priceRange.start)} - ₦${_formatPrice(_priceRange.end)}',
                style: TextStyle(color: Colors.grey[600], fontSize: 12),
              ),
            ],
          ),
          RangeSlider(
            values: _priceRange,
            min: 10000,
            max: 500000,
            divisions: 49,
            activeColor: AppConstants.primaryColor,
            labels: RangeLabels(
              '₦${_formatPrice(_priceRange.start)}',
              '₦${_formatPrice(_priceRange.end)}',
            ),
            onChanged: (values) {
              setState(() {
                _priceRange = values;
              });
            },
            onChangeEnd: (_) => _performSearch(),
          ),

          const SizedBox(height: 16),

          // Bedrooms
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Min Bedrooms', style: TextStyle(fontWeight: FontWeight.w600)),
              Row(
                children: List.generate(5, (index) {
                  final num = index + 1;
                  return GestureDetector(
                    onTap: () {
                      setState(() {
                        _minBedrooms = num;
                      });
                      _performSearch();
                    },
                    child: Container(
                      width: 36,
                      height: 36,
                      margin: const EdgeInsets.only(left: 8),
                      decoration: BoxDecoration(
                        color: _minBedrooms == num ? AppConstants.primaryColor : Colors.grey[200],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        '$num${index == 4 ? '+' : ''}',
                        style: TextStyle(
                          color: _minBedrooms == num ? Colors.white : Colors.black,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  );
                }),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Amenities
          const Text('Amenities', style: TextStyle(fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _amenities.map((amenity) {
              final isSelected = _selectedAmenities.contains(amenity);
              return GestureDetector(
                onTap: () {
                  setState(() {
                    if (isSelected) {
                      _selectedAmenities.remove(amenity);
                    } else {
                      _selectedAmenities.add(amenity);
                    }
                  });
                  _performSearch();
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: isSelected ? AppConstants.primaryColor.withOpacity(0.1) : Colors.grey[100],
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isSelected ? AppConstants.primaryColor : Colors.grey[300]!,
                    ),
                  ),
                  child: Text(
                    amenity.toUpperCase(),
                    style: TextStyle(
                      fontSize: 12,
                      color: isSelected ? AppConstants.primaryColor : Colors.grey[700],
                      fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),

          const SizedBox(height: 16),

          // Clear filters button
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () {
                setState(() {
                  _selectedCity = null;
                  _selectedCategory = null;
                  _priceRange = const RangeValues(10000, 500000);
                  _minBedrooms = 1;
                  _selectedAmenities = [];
                  _searchController.clear();
                });
                _performSearch();
              },
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.red,
                side: const BorderSide(color: Colors.red),
              ),
              child: const Text('Clear All Filters'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryChips() {
    return Container(
      height: 50,
      color: Colors.white,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        children: [
          _buildCategoryChip('All', null),
          ..._categories.map((cat) => _buildCategoryChip(_formatCategory(cat), cat)),
        ],
      ),
    );
  }

  Widget _buildCategoryChip(String label, String? value) {
    final isSelected = _selectedCategory == value;
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedCategory = value;
        });
        _performSearch();
      },
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? AppConstants.primaryColor : Colors.grey[100],
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : Colors.black,
            fontWeight: FontWeight.w500,
            fontSize: 13,
          ),
        ),
      ),
    );
  }

  Widget _buildSortBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      color: Colors.grey[50],
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Consumer<PropertyProvider>(
            builder: (context, provider, _) {
              return Text(
                '${provider.searchResults.length} properties found',
                style: TextStyle(color: Colors.grey[600], fontSize: 13),
              );
            },
          ),
          PopupMenuButton<String>(
            offset: const Offset(0, 40),
            child: Row(
              children: [
                Text(
                  'Sort: ${_sortOptions.firstWhere((o) => o['value'] == _sortBy)['label']}',
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
                ),
                const Icon(Icons.arrow_drop_down, size: 20),
              ],
            ),
            itemBuilder: (context) => _sortOptions.map((option) {
              return PopupMenuItem(
                value: option['value'] as String,
                child: Text(option['label'] as String),
              );
            }).toList(),
            onSelected: (value) {
              setState(() {
                _sortBy = value;
              });
            },
          ),
        ],
      ),
    );
  }

  Widget _buildPropertyCard(Map<String, dynamic> property) {
    return GestureDetector(
      onTap: () {
        Navigator.pushNamed(context, '/property-details', arguments: property['id']);
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.08),
              blurRadius: 20,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
              child: Stack(
                children: [
                  Image.network(
                    property['imageUrl'] ?? property['images']?[0] ?? 'https://via.placeholder.com/400x250',
                    height: 180,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      height: 180,
                      color: Colors.grey[300],
                      child: const Icon(Icons.image, size: 50, color: Colors.grey),
                    ),
                  ),
                  Positioned(
                    top: 12,
                    right: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.star, color: Colors.amber, size: 16),
                          const SizedBox(width: 4),
                          Text(
                            '${property['rating'] ?? 0}',
                            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                  ),
                  if (property['category'] != null)
                    Positioned(
                      top: 12,
                      left: 12,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppConstants.primaryColor,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          _formatCategory(property['category']),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),

            // Details
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    property['title'] ?? 'Property',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(Icons.location_on, size: 14, color: Colors.grey[600]),
                      const SizedBox(width: 4),
                      Text(
                        '${property['city']}, ${property['state']}',
                        style: TextStyle(color: Colors.grey[600], fontSize: 13),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          _buildFeatureChip('${property['bedrooms']} bed'),
                          const SizedBox(width: 8),
                          _buildFeatureChip('${property['bathrooms']} bath'),
                          const SizedBox(width: 8),
                          _buildFeatureChip('${property['maxGuests']} guests'),
                        ],
                      ),
                      Text(
                        '₦${_formatPrice(property['pricePerNight'])}/night',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: AppConstants.primaryColor,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFeatureChip(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        text,
        style: TextStyle(fontSize: 11, color: Colors.grey[700]),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.search_off, size: 80, color: Colors.grey[300]),
          const SizedBox(height: 16),
          Text(
            'No properties found',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: Colors.grey[600]),
          ),
          const SizedBox(height: 8),
          Text(
            'Try adjusting your filters',
            style: TextStyle(color: Colors.grey[500]),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () {
              setState(() {
                _selectedCity = null;
                _selectedCategory = null;
                _priceRange = const RangeValues(10000, 500000);
                _minBedrooms = 1;
                _selectedAmenities = [];
              });
              _performSearch();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppConstants.primaryColor,
              foregroundColor: Colors.white,
            ),
            child: const Text('Clear Filters'),
          ),
        ],
      ),
    );
  }

  String _formatPrice(dynamic price) {
    if (price == null) return '0';
    final num = (price is int) ? price : (price as double).toInt();
    if (num >= 1000) {
      return '${(num / 1000).toStringAsFixed(0)}K';
    }
    return num.toString();
  }

  String _formatCategory(String category) {
    switch (category.toLowerCase()) {
      case 'apartment':
        return 'Apartment';
      case 'hotel':
        return 'Hotel';
      case 'shortlet':
        return 'Shortlet';
      case 'nightlife':
        return 'Nightlife';
      default:
        return category;
    }
  }
}
