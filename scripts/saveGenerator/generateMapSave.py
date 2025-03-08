from collections import defaultdict
import csv
import json
import subprocess
import sys
import os

'''
Script to store only a concrete map setup into a generic save file.
Useful to share runs without having to share entire account.
Run with the save file (either Profile.Save or unpacked json) and the map name to copy, without spaces (for example: LastResort).
It will output as Profile.Save, so be careful with overrides!
'''

save_json_template = 'ProfileTemplate.json'
temp_json_file = '_filled_template_temp.json'
temp_unpack_json = '_temp_unpacked.json'
monke_executable_relative = 'monke.exe'

def copy_map_saved_data(source_json, target_json, map_name, output_json):
    with open(source_json, 'r', encoding='utf-8-sig') as f1, open(target_json, 'r', encoding='utf-8-sig') as f2:
        source_data = json.load(f1)
        target_data = json.load(f2)
    
    if map_name not in source_data.get('savedMaps', {}):
        raise ValueError(f"Map '{map_name}' not found in source JSON")
    
    if 'savedMaps' not in target_data:
        target_data['savedMaps'] = {}
    
    target_data['savedMaps'][map_name] = source_data['savedMaps'][map_name]
    
    with open(output_json, 'w') as f:
        json.dump(target_data, f, indent=4)
    
    print(f"Copied savedMaps for '{map_name}' to {output_json}")

def extract_tower_pops(json_file: str, map_name: str, output_csv:str):
    """
    Extract tower pop counts from a BTD6 save file.
    
    Args:
        json_file (str): Path to the BTD6 save file (JSON)
        map_name (str): Name of the map to extract data from
        output_csv (str): Name of the output CSV file
    """
    try:
        # Load the JSON file
        with open(json_file, 'r', encoding='utf-8-sig') as f:
            data = json.load(f)
            
        if map_name not in data['savedMaps']:
            print(f"Error: Map '{map_name}' not found in save file")
            print(f"Available maps: {', '.join(data['savedMaps'].keys())}")
            sys.exit(1)
            
        if 'placedTowers' not in data['savedMaps'][map_name]:
            print(f"Error: No placed towers found in map '{map_name}'")
            sys.exit(1)
        
        placed_towers = data['savedMaps'][map_name]['placedTowers']
        
        # Aggregate pop counts by tower type
        tower_pops = defaultdict(lambda: {'count': 0, 'damage': 0})
        
        for tower in placed_towers:
            if 'towerName' in tower and 'damageDealt' in tower:
                tower_type = tower['towerName']
                damage = tower['damageDealt']
                
                tower_pops[tower_type]['count'] += 1
                tower_pops[tower_type]['damage'] += damage
        
        # Prepare data for CSV
        csv_data = []
        for tower_type, stats in tower_pops.items():
            # Format tower name with count if more than one
            if stats['count'] > 1:
                display_name = f"{tower_type} (x{stats['count']})"
            else:
                display_name = tower_type
                
            csv_data.append({
                'towerType': display_name,
                'popCount': stats['damage']
            })
        
        # Sort by pop count (descending)
        csv_data.sort(key=lambda x: x['popCount'], reverse=True)
        
        # Write to CSV
        with open(output_csv, 'w', newline='') as csvfile:
            fieldnames = ['towerType', 'popCount']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            for row in csv_data:
                writer.writerow(row)
        
        print(f"Successfully wrote data to {output_csv}")
        print(f"Found {len(csv_data)} different tower types with a total of {sum(item['count'] for item in tower_pops.values())} towers")
        
    except FileNotFoundError:
        print(f"Error: File '{json_file}' not found")
        sys.exit(1)
    except json.JSONDecodeError:
        print(f"Error: '{json_file}' is not a valid JSON file")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)

def pack_json(source_json, output_save, monke_exe):
    process = subprocess.Popen([monke_exe, 'pack', source_json, output_save, '11'])
    process.wait()

def unpack_json(source_save, output_json, monke_exe):
    process = subprocess.Popen([monke_exe, 'unpack', source_save, output_json, '11'])
    process.wait()

def main():
    if len(sys.argv) != 4 and len(sys.argv) != 5:
        print("Usage: python script.py <input_file> <map_name> <output_file> [<popcount_csv>]")
        sys.exit(1)
    
    script_path = sys.argv[0]
    input_file = sys.argv[1]
    map_name = sys.argv[2]
    output_file = sys.argv[3]
    export_popcount = len(sys.argv) == 5
    if export_popcount:
        popcount_csv = sys.argv[4]

    monke_exe = os.path.join(os.path.dirname(script_path), monke_executable_relative)
    save_template_location = os.path.join(os.path.dirname(script_path), save_json_template)

    print("monke_exe:", monke_exe)
    
    try:
        # Determine if input is .save or .json
        if input_file.lower().endswith('.save'):
            # Unpack .save file first
            unpack_json(input_file, temp_unpack_json, monke_exe)
            print("a")
            input_file = temp_unpack_json
        
        copy_map_saved_data(input_file, save_template_location, map_name, temp_json_file)

        if export_popcount:
            extract_tower_pops(input_file, map_name, popcount_csv)
        
        pack_json(temp_json_file, output_file, monke_exe)
        
        print(f"Successfully processed {map_name} and created {output_file}")
    
    finally:
        # Clean up temporary files
        for temp_file in [temp_json_file, temp_unpack_json]:
            if os.path.exists(temp_file):
                os.remove(temp_file)

if __name__ == "__main__":
    main()