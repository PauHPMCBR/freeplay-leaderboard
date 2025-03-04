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

def pack_json(source_json, output_save, monke_exe):
    process = subprocess.Popen([monke_exe, 'pack', source_json, output_save, '11'])
    process.wait()

def unpack_json(source_save, output_json, monke_exe):
    process = subprocess.Popen([monke_exe, 'unpack', source_save, output_json, '11'])
    process.wait()

def main():
    if len(sys.argv) != 4:
        print("Usage: python script.py <input_file> <map_name> <output_file>")
        sys.exit(1)
    
    script_path = sys.argv[0]
    input_file = sys.argv[1]
    map_name = sys.argv[2]
    output_file = sys.argv[3]

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
        
        pack_json(temp_json_file, output_file, monke_exe)
        
        print(f"Successfully processed {map_name} and created {output_file}")
    
    finally:
        # Clean up temporary files
        for temp_file in [temp_json_file, temp_unpack_json]:
            if os.path.exists(temp_file):
                os.remove(temp_file)

if __name__ == "__main__":
    main()