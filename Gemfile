source 'https://rubygems.org'

# You may use http://rbenv.org/ or https://rvm.io/ to install and use this version
ruby ">= 2.6.10"

# Exclude problematic versions of cocoapods and activesupport that causes build failures.
# CocoaPods >= 1.16 is required for Xcode 26 / Ruby 4; the old xcodeproj and
# concurrent-ruby caps (kept for Ruby < 3.4) block that upgrade, so they are lifted.
gem 'cocoapods', '>= 1.16', '!= 1.15.0', '!= 1.15.1'
gem 'activesupport', '>= 6.1.7.5', '!= 7.1.0'

# Ruby 3.4.0 has removed some libraries from the standard library.
gem 'bigdecimal'
gem 'logger'
gem 'benchmark'
gem 'mutex_m'
# Ruby 3.4+/4.0 removed these too — CocoaPods' CFPropertyList needs `kconv`
# (provided by nkf), and molinillo uses tsort.
gem 'nkf'
gem 'tsort'
