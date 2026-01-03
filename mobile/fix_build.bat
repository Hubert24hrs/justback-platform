@echo off
echo Generating local.properties with forward slashes...
echo sdk.dir=C:/Users/HP/AppData/Local/Android/Sdk > android\local.properties
echo flutter.sdk=C:/src/flutter/flutter >> android\local.properties
echo flutter.buildMode=debug >> android\local.properties
echo flutter.versionName=1.0.0 >> android\local.properties
echo flutter.versionCode=1 >> android\local.properties

echo Cleaning project...
call flutter clean

echo Building APK...
call flutter build apk --debug
