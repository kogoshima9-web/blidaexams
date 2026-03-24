with open('pharmaco_qcm.txt', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.split('\n')

# Print first 50 lines with repr to see exact characters
for i, line in enumerate(lines[:60]):
    if line.strip():
        print(f"{i}: {repr(line)}")
