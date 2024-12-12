import React, { useRef, useState, useEffect } from 'react';
import NavigationPane from './NavigationPane';
import Comments from './Comments';
import './DocumentWorkspace.css';

const DocumentWorkspace = () => {
    const textRef = useRef();
    const [fontSize, setFontSize] = useState('16px');
    const [fontFamily, setFontFamily] = useState('Arial');
    const [textColor, setTextColor] = useState('#000000');
    const [bgColor, setBgColor] = useState('#FFFFFF');
    const undoStack = useRef([]);
    const redoStack = useRef([]);
    const [headings, setHeadings] = useState([]);
    const [comments, setComments] = useState([]);
    const [zoomLevel, setZoomLevel] = useState(100);

    const formatText = (command) => {
        // Save current state to undo stack
        undoStack.current.push(textRef.current.innerHTML);
        redoStack.current = []; // Clear redo stack
        document.execCommand(command);
        textRef.current.focus();
    };

    const undo = () => {
        if (undoStack.current.length > 0) {
            const lastState = undoStack.current.pop();
            console.log('Undoing to state:', lastState);
            redoStack.current.push(textRef.current.innerHTML);
            textRef.current.innerHTML = lastState;
            console.log('Current undo stack:', undoStack.current);
            console.log('Current redo stack:', redoStack.current);
        } else {
            console.log('No states to undo.');
        }
    };

    const redo = () => {
        if (redoStack.current.length > 0) {
            const lastState = redoStack.current.pop();
            console.log('Redoing to state:', lastState);
            undoStack.current.push(textRef.current.innerHTML);
            textRef.current.innerHTML = lastState;
            console.log('Current undo stack:', undoStack.current);
            console.log('Current redo stack:', redoStack.current);
        } else {
            console.log('No states to redo.');
        }
    };

    const addComment = (text) => {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const comment = { text, range };
        setComments([...comments, comment]);
        textRef.current.focus();
    };

    const handleDeleteComment = (index) => {
        const newComments = comments.filter((_, i) => i !== index);
        setComments(newComments);
    };

    const updateHeadings = () => {
        const headingElements = textRef.current.querySelectorAll('h1, h2, h3');
        const newHeadings = Array.from(headingElements).map((heading) => ({
            id: heading.id,
            text: heading.innerText
        }));
        setHeadings(newHeadings);
    };

    const handleHeadingClick = (id) => {
        const headingElement = document.getElementById(id);
        if (headingElement) {
            headingElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = document.createElement('img');
                img.src = event.target.result;
                img.style.maxWidth = '100%';
                img.style.margin = '10px 0';
                textRef.current.appendChild(img);
                undoStack.current.push(textRef.current.innerHTML); // Save current state to undo stack
                redoStack.current = []; // Clear redo stack
            };
            reader.readAsDataURL(files[0]);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const insertPageBreak = () => {
        const pageBreak = document.createElement('div');
        pageBreak.style.borderTop = '1px dashed #ccc';
        pageBreak.style.margin = '20px 0';
        textRef.current.appendChild(pageBreak);
        undoStack.current.push(textRef.current.innerHTML); // Save current state to undo stack
        redoStack.current = []; // Clear redo stack
        textRef.current.focus();
    };

    const saveDocument = () => {
        const content = textRef.current.innerHTML;
        localStorage.setItem('documentContent', content);
        alert('Document saved!');
    };

    const loadDocument = () => {
        const content = localStorage.getItem('documentContent');
        if (content) {
            textRef.current.innerHTML = content;
            undoStack.current = []; // Clear undo stack
            redoStack.current = []; // Clear redo stack
            alert('Document loaded!');
        } else {
            alert('No saved document found.');
        }
    };

    const uploadDocument = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                textRef.current.innerHTML = e.target.result;
                undoStack.current = []; // Clear undo stack
                redoStack.current = []; // Clear redo stack
                alert('Document uploaded!');
            };
            reader.readAsText(file);
        }
    };

    const downloadDocument = () => {
        const content = textRef.current.innerHTML;
        const blob = new Blob([content], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'document.txt';
        link.click();
        alert('Document downloaded!');
    };

    const specialCharacters = ['©', '®', '™', '€', '£', '¥', '•', '∞', '✓', '♥'];

    const insertSpecialCharacter = (character) => {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(character));
        textRef.current.focus();
    };

    const insertFootnote = () => {
        const selection = window.getSelection();
        const footnoteText = prompt('Enter footnote text:');
        const footnote = document.createElement('sup');
        footnote.innerText = `[*]`;
        footnote.onclick = () => alert(footnoteText);
        selection.getRangeAt(0).insertNode(footnote);
    };

    const insertTable = () => {
        const rows = prompt('Enter number of rows:');
        const cols = prompt('Enter number of columns:');
        const table = document.createElement('table');
        for (let i = 0; i < rows; i++) {
            const row = table.insertRow(i);
            for (let j = 0; j < cols; j++) {
                const cell = row.insertCell(j);
                cell.innerHTML = '';
            }
        }
        textRef.current.appendChild(table);
        undoStack.current.push(textRef.current.innerHTML); // Save current state to undo stack
        redoStack.current = []; // Clear redo stack
        textRef.current.focus();
    };

    const addLink = () => {
        const url = prompt('Enter URL:');
        const linkText = prompt('Enter link text:');
        const link = document.createElement('a');
        link.href = url;
        link.innerText = linkText;
        textRef.current.appendChild(link);
    };

    const changeZoom = (level) => {
        setZoomLevel(level);
        textRef.current.style.zoom = `${level}%`;
    };

    useEffect(() => {
        updateHeadings();
    }, []);

    return (
        <div className="document-workspace" onDrop={handleDrop} onDragOver={handleDragOver}>
            <NavigationPane headings={headings} onHeadingClick={handleHeadingClick} />
            <Comments comments={comments} onDelete={handleDeleteComment} />
            <div className="editor">
                <div className="toolbar">
                    <select onChange={(e) => insertSpecialCharacter(e.target.value)}>
                        <option value="">Insert Special Character</option>
                        {specialCharacters.map((char, index) => (
                            <option key={index} value={char}>{char}</option>
                        ))}
                    </select>
                    <input type="color" value={textColor} onChange={(e) => {
                        setTextColor(e.target.value);
                        textRef.current.style.color = e.target.value;
                    }} />
                    <input type="color" value={bgColor} onChange={(e) => {
                        setBgColor(e.target.value);
                        textRef.current.style.backgroundColor = e.target.value;
                    }} />
                    <button onClick={undo}>Undo</button>
                    <button onClick={redo}>Redo</button>
                    <select onChange={(e) => setFontFamily(e.target.value)}>
                        <option value="Arial">Arial</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                    </select>
                    <select onChange={(e) => setFontSize(e.target.value)}>
                        <option value="16px">16</option>
                        <option value="20px">20</option>
                        <option value="24px">24</option>
                    </select>
                    <button onClick={() => formatText('bold')}>Bold</button>
                    <button onClick={() => formatText('italic')}>Italic</button>
                    <button onClick={() => formatText('underline')}>Underline</button>
                    <button onClick={() => formatText('insertOrderedList')}>Numbered List</button>
                    <button onClick={() => formatText('insertUnorderedList')}>Bulleted List</button>
                    <button onClick={() => formatText('justifyLeft')}>Left Align</button>
                    <button onClick={() => formatText('justifyCenter')}>Center Align</button>
                    <button onClick={() => formatText('justifyRight')}>Right Align</button>
                    <button onClick={insertPageBreak}>Insert Page Break</button>
                    <button onClick={saveDocument}>Save Document</button>
                    <button onClick={loadDocument}>Load Document</button>
                    <button onClick={downloadDocument}>Download Document</button>
                    <input type="file" accept="text/plain" onChange={uploadDocument} style={{ display: 'none' }} id="uploadInput" />
                    <label htmlFor="uploadInput" style={{ cursor: 'pointer' }}>Upload Document</label>
                    <button onClick={() => addComment(prompt('Enter your comment:'))}>Add Comment</button>
                    <button onClick={insertFootnote}>Insert Footnote</button>
                    <button onClick={insertTable}>Insert Table</button>
                    <button onClick={addLink}>Add Link</button>
                    <input type="color" value={textColor} onChange={(e) => {
                        setTextColor(e.target.value);
                        textRef.current.style.color = e.target.value;
                    }} />
                    <button onClick={() => changeZoom(75)}>75%</button>
                    <button onClick={() => changeZoom(100)}>100%</button>
                    <button onClick={() => changeZoom(125)}>125%</button>
                </div>
                <div 
                    ref={textRef} 
                    contentEditable 
                    style={{ fontSize, fontFamily, color: textColor, backgroundColor: bgColor, zoom: `${zoomLevel}%` }}
                    onInput={updateHeadings}
                    className="editor-text-area"
                    placeholder="Start typing here...">
                </div>
            </div>
        </div>
    );
};

export default DocumentWorkspace;
