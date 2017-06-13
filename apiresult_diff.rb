# frozen_string_literal: true

require 'json'

def ok?(result)
  result['status'] == 'OK'
end

def print_count(prefix, result)
  puts "#{prefix} : #{result['results'].size}"
end

def type(component)
  component['types'].join(', ')
end

def include?(component, target_components)
  c_place_id = component['place_id']
  target_components.any? do |t|
    t['place_id'] == c_place_id
  end
end

def address_diff(comp_source_results, comp_target_results)
  s_results = comp_source_results['results']
  t_results = comp_target_results['results']
  diff = s_results.select do |s|
    !include?(s, t_results)
  end
  diff.flat_map do |d|
    puts d['place_id']
    d['address_components']
  end
end

def address_same(source_results, target_results)
  s_results = source_results['results']
  t_results = target_results['results']
  sames = s_results.select do |s|
    include?(s, t_results)
  end
  sames.flat_map do |s|
    puts s['place_id']
    s['address_components']
  end
end

def print_address_components(components)
  match_levels = components.map do |c|
    "#{type(c)} : #{c['long_name']}"
  end
  puts match_levels.join("\n")
end

def print_match_level(result)
  components = result['address_components'].reverse
  print_address_components(components)
end

def print_results(type, results)
  print_count(type, results)
  return unless ok?(results)

  results['results'].each_with_index do |r, i|
    puts "[#{type}#{i + 1}]"
    print_match_level(r)
  end
end

def read_result(filepath)
  result = File.read(filepath)
  JSON.parse(result)
end

no_postcode = read_result('./jp.json')
with_postcode = read_result('./ma.json')

print_results('郵便番号無', no_postcode)
print_results('郵便番号有', with_postcode)

puts "\n++++++++++++++++++++++++++++++++++"
puts '同一アドレス'
sames = address_same(no_postcode, with_postcode)
print_address_components(sames.reverse)

puts "\n++++++++++++++++++++++++++++++++++"
puts '郵便番号無 差分'
diff1 = address_diff(no_postcode, with_postcode)
print_address_components(diff1.reverse)

puts "\n++++++++++++++++++++++++++++++++++"
puts '郵便番号有 差分'
diff2 = address_diff(with_postcode, no_postcode)
print_address_components(diff2.reverse)
