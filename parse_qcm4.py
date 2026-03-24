import re, sys

with open('pharmaco_qcm.txt', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.split('\n')

def letter_to_idx(l):
    return ord(l.lower()) - ord('a')

def answer_to_indices(ans):
    return sorted([letter_to_idx(ch) for ch in ans.lower() if ch in 'abcde'])

questions = []
i = 0

while i < len(lines):
    line = lines[i].strip()
    
    m = re.match(r'^(\d+)--\s*(.*)$', line)
    if m:
        qnum = int(m.group(1))
        qtext = m.group(2).rstrip()
        
        # Collect all lines until next question or end
        block_lines = []
        j = i + 1
        while j < len(lines):
            next_line = lines[j].strip()
            next_m = re.match(r'^(\d+)--\s*', next_line)
            if next_m:
                break
            block_lines.append(next_line)
            j += 1
        
        # Parse block into options, answer, and notes
        opts = []
        answer = None
        k = 0
        current_opt_letter = None
        current_opt_text = ''
        
        while k < len(block_lines):
            l = block_lines[k].strip()
            
            # Skip empty lines
            if not l:
                k += 1
                continue
            
            # Skip parenthetical notes like (4x la ½-vie)
            if l.startswith('(') and ')' in l:
                k += 1
                continue
            
            # Check if this is an option line
            opt_m = re.match(r'^([a-e])\.\s*(.*)$', l)
            if opt_m:
                # Save previous option
                if current_opt_letter:
                    opts.append((current_opt_letter, current_opt_text.strip()))
                current_opt_letter = opt_m.group(1)
                current_opt_text = opt_m.group(2)
            elif re.match(r'^[a-e]{1,5}$', l) and len(l) >= 1:
                # This is the answer
                answer = l
                break
            elif current_opt_letter:
                # Continuation of option text
                current_opt_text += ' ' + l
            
            k += 1
        
        # Save last option
        if current_opt_letter:
            opts.append((current_opt_letter, current_opt_text.strip()))
        
        questions.append({
            'num': qnum,
            'text': qtext,
            'opts': opts,
            'answer': answer if answer else '?'
        })
        
        i = j
    else:
        i += 1

# Write results to file with utf-8
with open('output_parsed.txt', 'w', encoding='utf-8') as f:
    f.write(f"Total questions: {len(questions)}\n\n")
    for q in questions:
        f.write(f"Q{q['num']} | {q['text']}\n")
        f.write(f"ANSWER: {q['answer']}\n")
        for l, t in q['opts']:
            f.write(f"  {l}. {t}\n")
        f.write("\n")

print(f"Parsed {len(questions)} questions. Output written to output_parsed.txt")
