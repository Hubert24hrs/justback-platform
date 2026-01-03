@echo off
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "ANDROID_HOME=C:\Users\HP\AppData\Local\Android\Sdk"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo JAVA_HOME=%JAVA_HOME%
echo Testing Java:
"%JAVA_HOME%\bin\java" -version

echo.
echo Building:
cd android
.\gradlew assembleRelease --info 2>&1
