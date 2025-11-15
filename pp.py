import os
import time

def update_mod_times(folder_path):
    # current timestamp
    now = time.time()

    # iterate through all items in folder
    for filename in os.listdir(folder_path):
        full_path = os.path.join(folder_path, filename)

        # only modify files, not directories
        if os.path.isfile(full_path):
            os.utime(full_path, (now, now))
            print(f"Updated: {full_path}")

if __name__ == "__main__":
    folder = input("Enter the folder path: ").strip()
    update_mod_times(folder)
    print("Done!")
