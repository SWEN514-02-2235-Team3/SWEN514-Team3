import tkinter as tk
import subprocess
from datetime import datetime, timedelta
import os
import re 
from plyer import notification

output_text = None

def update_timer(root, label, remaining_time):
    remaining_time -= timedelta(seconds=1)
    if remaining_time.total_seconds() == 0:
        run_terraform_destroy()
    else:
        label.config(text=f"{remaining_time} until terraform destroy...")
        root.after(1000, lambda: update_timer(root, label, remaining_time))

def parse_ansi_escape_codes(text):
    ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')
    return ansi_escape.sub('', text)

def run_terraform_destroy():
    output_text.delete(1.0, tk.END)  # Clear previous output
    try:
        os.chdir("terraform/")
        process = subprocess.Popen(["terraform", "destroy", "-auto-approve"], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, universal_newlines=True)
        while True:
            output_line = process.stdout.readline()
            if output_line == '' and process.poll() is not None:
                break
            if output_line:
                cleaned_line = parse_ansi_escape_codes(output_line)
                output_text.insert(tk.END, cleaned_line)
        process.stdout.close()
        process.wait()
    except subprocess.CalledProcessError as e:
        output_text.insert(tk.END, f"Error: {e.output}")

def main():
    global output_text
    root = tk.Tk()
    root.title("Teardown Timer")
    root.geometry("600x300")

    label = tk.Label(root, text="", font=("Arial", 24))
    label.pack()

    remaining_time = timedelta(hours=2)
    update_timer(root, label, remaining_time)    
    scrollbar = tk.Scrollbar(root)
    scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
    
    output_text = tk.Text(root, wrap=tk.WORD, yscrollcommand=scrollbar.set)
    output_text.pack(fill=tk.BOTH, expand=True)
    output_text.insert(tk.END, "CLI output for terraform destroy")
    
    scrollbar.config(command=output_text.yview)
    notification.notify(
        title='Teardown Timer',
        message='Started teardown timer...',
        app_icon=None, 
        timeout=10, 
    )


    root.mainloop()

if __name__ == "__main__":
    main()