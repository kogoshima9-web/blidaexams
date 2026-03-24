import re

with open('pharmaco_qcm.txt', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.split('\n')

questions = []
current_q = None
current_opts = []

# Map letter to index: a=0, b=1, c=2, d=3, e=4
def letter_to_idx(l):
    return ord(l.lower()) - ord('a')

def answer_to_indices(ans):
    result = []
    for ch in ans.lower():
        if ch in 'abcde':
            result.append(letter_to_idx(ch))
    return sorted(result)

i = 0
while i < len(lines):
    line = lines[i].strip()
    
    # Match question number pattern like "11--", "22--", "33--", etc.
    m = re.match(r'^(\d+)--\s*(.*)$', line)
    if m:
        qnum = int(m.group(1))
        qtext = m.group(2).rstrip()
        
        # Save previous question if exists
        if current_q is not None:
            questions.append({'num': current_q, 'text': current_q_text, 'opts': list(current_opts)})
        
        current_q = qnum
        current_q_text = qtext
        current_opts = []
        
        # Collect options (a., b., c., d., e.)
        j = i + 1
        while j < len(lines) and j < i + 10:
            opt_line = lines[j].strip()
            opt_m = re.match(r'^([a-e])\.\s*(.*)$', opt_line)
            if opt_m:
                letter = opt_m.group(1)
                text = opt_m.group(2)
                current_opts.append((letter, text))
                j += 1
            elif re.match(r'^[a-e]$', opt_line) and len(opt_line) == 1:
                # Just a single letter on a line - might be answer for this Q
                j += 1
            elif opt_line and not opt_line[0].isalpha() and opt_line[0] not in '([≤≥½±°−–—':
                # Continuation of previous option text
                if current_opts:
                    ltr, txt = current_opts[-1]
                    current_opts[-1] = (ltr, txt + ' ' + opt_line)
                j += 1
            else:
                break
        
        # Look ahead for answer (skip empty lines, answer lines)
        k = j
        answer_found = False
        while k < len(lines) and k < j + 5:
            next_line = lines[k].strip()
            # Skip parenthetical notes like (4x la ½-vie)
            if next_line.startswith('(') and ')' in next_line:
                k += 1
                continue
            # Match answer pattern: abc, abcd, ad, c, etc.
            if re.match(r'^[a-z]{1,5}$', next_line) and len(next_line) >= 1:
                # This is the answer
                questions[-1]['answer'] = next_line if 'num' in questions[-1] else None
                if 'num' in questions[-1]:
                    questions[-1]['answer'] = next_line
                else:
                    questions[-1]['answer'] = next_line
                answer_found = True
                break
            elif next_line == '' or next_line.startswith('['):
                k += 1
            else:
                break
        
        i = k
        if not answer_found:
            i = j
    
    i += 1

# Save last question
if current_q is not None:
    questions.append({'num': current_q, 'text': current_q_text, 'opts': list(current_opts)})

# Now match answers to questions
# The answer should come after the options
# Let's process: for each question without an answer, look at the next non-empty line

# Better approach: scan sequentially and pair questions with their answers
print(f"Total questions found: {len(questions)}")
for q in questions:
    ans = q.get('answer', '?')
    print(f"Q{q['num']}: {q['text'][:60]}... opts={len(q['opts'])} answer={ans}")
