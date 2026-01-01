import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/providers/host_provider.dart';
import '../../core/constants/app_constants.dart';
import '../../core/widgets/glass_box.dart';

class AddPropertyScreen extends StatefulWidget {
  const AddPropertyScreen({Key? key}) : super(key: key);

  @override
  State<AddPropertyScreen> createState() => _AddPropertyScreenState();
}

class _AddPropertyScreenState extends State<AddPropertyScreen> {
  int _currentStep = 0;
  final PageController _pageController = PageController();

  // Form Fields
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _priceController = TextEditingController();
  String _category = 'Apartment';
  final _addressController = TextEditingController();
  final _cityController = TextEditingController();
  final _stateController = TextEditingController();
  int _bedrooms = 1;
  int _bathrooms = 1;
  int _maxGuests = 2;

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _priceController.dispose();
    _addressController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    _pageController.dispose();
    super.dispose();
  }

  void _nextStep() {
    if (_currentStep < 2) {
      _pageController.nextPage(duration: const Duration(milliseconds: 300), curve: Curves.easeInOut);
      setState(() => _currentStep++);
    } else {
      _handleSave();
    }
  }

  void _prevStep() {
    if (_currentStep > 0) {
      _pageController.previousPage(duration: const Duration(milliseconds: 300), curve: Curves.easeInOut);
      setState(() => _currentStep--);
    } else {
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF03050C),
      appBar: AppBar(
        title: const Text('Add Property', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Column(
        children: [
          // Custom Progress Indicator
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            child: Row(
              children: [
                _buildStepIndicator(0, 'Info'),
                _buildStepConnector(0),
                _buildStepIndicator(1, 'Loc'),
                _buildStepConnector(1),
                _buildStepIndicator(2, 'Opts'),
              ],
            ),
          ),
          
          Expanded(
            child: PageView(
              controller: _pageController,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                _buildInfoPage(),
                _buildLocationPage(),
                _buildAmenitiesPage(),
              ],
            ),
          ),

          // Bottom Bar
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: const Color(0xFF0A0E21),
              border: Border(top: BorderSide(color: Colors.white.withOpacity(0.05))),
            ),
            child: Row(
              children: [
                if (_currentStep > 0)
                  Expanded(
                    child: TextButton(
                      onPressed: _prevStep,
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      child: const Text('Back', style: TextStyle(color: Colors.white54, fontSize: 16)),
                    ),
                  ),
                if (_currentStep > 0) const SizedBox(width: 16),
                Expanded(
                  flex: 2,
                  child: ElevatedButton(
                    onPressed: _nextStep,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppConstants.primaryColor,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      elevation: 8,
                      shadowColor: AppConstants.primaryColor.withOpacity(0.4),
                    ),
                    child: Text(
                      _currentStep == 2 ? 'PUBLISH LISTING' : 'CONTINUE',
                      style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 16, letterSpacing: 1),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
  
  // Pages
  Widget _buildInfoPage() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Basic Details', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          const Text('Tell guests about your place.', style: TextStyle(color: Colors.white54, fontSize: 14)),
          const SizedBox(height: 32),
          
          _buildNeonInput(controller: _titleController, label: 'Property Title', icon: Icons.title_rounded),
          const SizedBox(height: 20),
          
          Container(
             decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.05),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white.withOpacity(0.1)),
             ),
             padding: const EdgeInsets.symmetric(horizontal: 16),
             child: DropdownButtonHideUnderline(
               child: DropdownButton<String>(
                 value: _category,
                 isExpanded: true,
                 dropdownColor: const Color(0xFF1A1D2D),
                 style: const TextStyle(color: Colors.white),
                 icon: const Icon(Icons.keyboard_arrow_down_rounded, color: AppConstants.primaryColor),
                 items: ['Apartment', 'House', 'Villa', 'Studio']
                     .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                     .toList(),
                 onChanged: (v) => setState(() => _category = v!),
               ),
             ),
          ),
           const SizedBox(height: 20),
           _buildNeonInput(controller: _descriptionController, label: 'Description', icon: Icons.description_rounded, maxLines: 4),
           const SizedBox(height: 20),
           _buildNeonInput(controller: _priceController, label: 'Price per night', icon: Icons.attach_money_rounded, keyboardType: TextInputType.number),
           const SizedBox(height: 32),
           
           // Photo Upload
           Container(
             height: 140,
             decoration: BoxDecoration(
               color: AppConstants.primaryColor.withOpacity(0.05),
               borderRadius: BorderRadius.circular(20),
               border: Border.all(color: AppConstants.primaryColor.withOpacity(0.3), style: BorderStyle.none), // removed dashed for now to simplify
             ),
             child: CustomPaint(
                painter: _DashedBorderPainter(color: AppConstants.primaryColor, strokeWidth: 1.5, gap: 5.0),
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(color: AppConstants.primaryColor.withOpacity(0.1), shape: BoxShape.circle),
                        child: const Icon(Icons.add_a_photo_rounded, color: AppConstants.primaryColor, size: 28),
                      ),
                      const SizedBox(height: 12),
                      const Text('Upload Photos', style: TextStyle(color: AppConstants.primaryColor, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
             ),
           ),
        ],
      ),
    );
  }

  Widget _buildLocationPage() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
           const Text('Location', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          const Text('Where is your property located?', style: TextStyle(color: Colors.white54, fontSize: 14)),
          const SizedBox(height: 32),
          
          _buildNeonInput(controller: _addressController, label: 'Street Address', icon: Icons.place_rounded),
          const SizedBox(height: 20),
          _buildNeonInput(controller: _cityController, label: 'City', icon: Icons.location_city_rounded),
          const SizedBox(height: 20),
          _buildNeonInput(controller: _stateController, label: 'State / Province', icon: Icons.map_rounded),
          
          const SizedBox(height: 32),
          Container(
            height: 200,
            width: double.infinity,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(20),
              image: const DecorationImage(
                image: NetworkImage('https://maps.googleapis.com/maps/api/staticmap?center=Lagos&zoom=13&size=600x300&key=YOUR_API_KEY'), // Mock map
                fit: BoxFit.cover,
                opacity: 0.5,
              ),
              color: Colors.blueGrey.shade900,
            ),
            child: Center(
              child: Icon(Icons.location_on, size: 50, color: AppConstants.primaryColor.withOpacity(0.8)),
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildAmenitiesPage() {
    return SingleChildScrollView(
       padding: const EdgeInsets.all(24),
       child: Column(
         crossAxisAlignment: CrossAxisAlignment.start,
         children: [
          const Text('Amenities & Capacity', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          const Text('What does your place offer?', style: TextStyle(color: Colors.white54, fontSize: 14)),
          const SizedBox(height: 32),
          
          _buildCounter('Bedrooms', _bedrooms, (v) => setState(() => _bedrooms = v)),
          _buildCounter('Bathrooms', _bathrooms, (v) => setState(() => _bathrooms = v)),
          _buildCounter('Max Guests', _maxGuests, (v) => setState(() => _maxGuests = v)),
          
          const SizedBox(height: 32),
          const Text('Highlights', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              _buildAmenityChip('WiFi', Icons.wifi_rounded, true),
              _buildAmenityChip('Pool', Icons.pool_rounded, false),
              _buildAmenityChip('Gym', Icons.fitness_center_rounded, true),
              _buildAmenityChip('Parking', Icons.local_parking_rounded, true),
              _buildAmenityChip('AC', Icons.ac_unit_rounded, false),
            ],
          ),
         ],
       ),
    );
  }

  // Helpers
  Widget _buildNeonInput({required TextEditingController controller, required String label, required IconData icon, int maxLines = 1, TextInputType? keyboardType}) {
    return TextField(
      controller: controller,
      style: const TextStyle(color: Colors.white),
      maxLines: maxLines,
      keyboardType: keyboardType,
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Colors.white54),
        hintStyle: const TextStyle(color: Colors.white24),
        prefixIcon: Icon(icon, color: AppConstants.primaryColor.withOpacity(0.7)),
        filled: true,
        fillColor: Colors.white.withOpacity(0.05),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: Colors.white.withOpacity(0.1))),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: AppConstants.primaryColor)),
      ),
    );
  }
  
  Widget _buildCounter(String label, int value, Function(int) onChanged) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w500)),
          Row(
            children: [
              _buildIconBtn(Icons.remove, () => value > 0 ? onChanged(value - 1) : null),
              SizedBox(width: 40, child: Center(child: Text('$value', style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)))),
              _buildIconBtn(Icons.add, () => onChanged(value + 1)),
            ],
          ),
        ],
      ),
    );
  }
  
  Widget _buildIconBtn(IconData icon, VoidCallback? onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: onTap == null ? Colors.white.withOpacity(0.05) : AppConstants.primaryColor.withOpacity(0.1),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: onTap == null ? Colors.transparent : AppConstants.primaryColor.withOpacity(0.3)),
        ),
        child: Icon(icon, color: onTap == null ? Colors.white24 : AppConstants.primaryColor, size: 20),
      ),
    );
  }
  
  Widget _buildAmenityChip(String label, IconData icon, bool selected) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: selected ? AppConstants.primaryColor.withOpacity(0.2) : Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(30),
        border: Border.all(color: selected ? AppConstants.primaryColor : Colors.white.withOpacity(0.1)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 18, color: selected ? AppConstants.primaryColor : Colors.white54),
          const SizedBox(width: 8),
          Text(label, style: TextStyle(color: selected ? Colors.white : Colors.white54, fontWeight: selected ? FontWeight.bold : FontWeight.normal)),
        ],
      ),
    );
  }

  Widget _buildStepIndicator(int index, String label) {
    bool isActive = _currentStep >= index;
    bool isCurrent = _currentStep == index;
    
    return Column(
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: isActive ? AppConstants.primaryColor : Colors.transparent,
            shape: BoxShape.circle,
            border: Border.all(color: isActive ? AppConstants.primaryColor : Colors.white24),
          ),
          child: Center(
            child: isActive 
                ? const Icon(Icons.check, size: 16, color: Colors.black)
                : Text('${index + 1}', style: const TextStyle(color: Colors.white24)),
          ),
        ),
         const SizedBox(height: 4),
         Text(label, style: TextStyle(color: isCurrent ? Colors.white : Colors.white24, fontSize: 12)),
      ],
    );
  }
  
  Widget _buildStepConnector(int index) {
    return Expanded(
      child: Container(
        height: 2,
        margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 16),
        color: _currentStep > index ? AppConstants.primaryColor : Colors.white10,
      ),
    );
  }
  
  Future<void> _handleSave() async {
    final provider = context.read<HostProvider>();
    final success = await provider.addProperty({
       'title': _titleController.text,
       'category': _category,
       'description': _descriptionController.text,
       'basePrice': double.tryParse(_priceController.text) ?? 50000,
       'address': _addressController.text,
       'city': _cityController.text,
       'state': _stateController.text,
       'bedrooms': _bedrooms,
       'bathrooms': _bathrooms,
       'maxGuests': _maxGuests,
       'amenities': ['WiFi', 'Gym'], 
    });

    if (success && mounted) {
      Navigator.pop(context);
    } 
  }
}

class _DashedBorderPainter extends CustomPainter {
  final Color color;
  final double strokeWidth;
  final double gap;

  _DashedBorderPainter({required this.color, this.strokeWidth = 1.0, this.gap = 5.0});

  @override
  void paint(Canvas canvas, Size size) {
    final Paint paint = Paint()
      ..color = color
      ..strokeWidth = strokeWidth
      ..style = PaintingStyle.stroke;

    final Path path = Path()
      ..addRRect(RRect.fromRectAndRadius(Rect.fromLTWH(0, 0, size.width, size.height), const Radius.circular(20)));

    final PathMetrics pathMetrics = path.computeMetrics();
    for (PathMetric pathMetric in pathMetrics) {
      double distance = 0.0;
      while (distance < pathMetric.length) {
        canvas.drawPath(
          pathMetric.extractPath(distance, distance + 10), // Dash length fixed at 10 for now
          paint,
        );
        distance += 10 + gap;
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
