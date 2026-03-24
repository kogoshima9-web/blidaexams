import re

with open('pharmaco_qcm.txt', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.split('\n')

def letter_to_idx(l):
    return ord(l.lower()) - ord('a')

questions = []
i = 0

while i < len(lines):
    line = lines[i].strip()
    
    m = re.match(r'^(\d+)--\s*(.*)$', line)
    if m:
        qnum = int(m.group(1))
        qtext = m.group(2).rstrip()
        opts = []
        
        j = i + 1
        # Collect option lines
        while j < len(lines):
            opt_line = lines[j].strip()
            opt_m = re.match(r'^([a-e])\.\s*(.*)$', opt_line)
            if opt_m:
                letter = opt_m.group(1)
                opt_text = opt_m.group(2)
                # Check for continuation on next lines
                k = j + 1
                while k < len(lines):
                    cont_line = lines[k].strip()
                    # Check if this is a continuation (no option letter, no answer pattern)
                    cont_m = re.match(r'^([a-e])\.\s*(.*)$', cont_line)
                    if cont_m or re.match(r'^[a-z]{1,5}$', cont_line):
                        break
                    if cont_line:
                        opt_text += ' ' + cont_line
                        k += 1
                    else:
                        break
                opts.append((letter, opt_text))
                j = k if k > j else j + 1
            elif opt_line.startswith('(') or opt_line.startswith('NB') or opt_line == '' or opt_line.startswith('['):
                j += 1
            else:
                break
        
        # Now look for answer after options
        k = j
        answer = '?'
        while k < len(lines) and k < j + 5:
            next_line = lines[k].strip()
            if re.match(r'^[a-e]{1,5}$', next_line) and len(next_line) >= 1:
                answer = next_line
                k += 1
                break
            elif next_line.startswith('(') or next_line.startswith('NB') or next_line == '':
                k += 1
            else:
                break
        
        questions.append({
            'num': qnum,
            'text': qtext,
            'opts': opts,
            'answer': answer
        })
        i = k
    else:
        i += 1

print(f"Total questions found: {len(questions)}\n")
for q in questions[:40]:
    opts_str = ', '.join([f"{l}: {t[:50]}..." for l, t in q['opts']])
    print(f"Q{q['num']}: {q['text'][:80]}")
    print(f"  ANSWER: {q['answer']}")
    for l, t in q['opts']:
        print(f"  {l}. {t}")
    print()
