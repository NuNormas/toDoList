import { useEffect, useState, useRef } from "react";

function App() {
    const editInputRef = useRef(null)
    const [taskList, setTaskList] = useState([])
    const [editValue, setEditValue] = useState('')
    const [editIndex, setEditIndex] = useState(null)
    const [inputValue, setInputValue] = useState('')
    const [isEditing, setIsEditing] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [draggedIndex, setDraggedIndex] = useState(null)

    const inputChangeEvent = (event) => {
        setInputValue(event.target.value)
    }

    const addTask = () => {
        if (inputValue.trim() === '') return

        setTaskList([...taskList, {value: inputValue, status: 'uncompleted'}])
        setInputValue('')
    }

    const deleteTask = (i) => {
        const updatedTaskList = taskList.filter((currentTask, index) => {
            if (index !== i) {
                return true
            } else if (i === editIndex) {
                setEditValue('')
                setEditIndex(null)
                return false
            } else {
                return false
            }
        })
        setTaskList(updatedTaskList)
    }

    const editProcess = (i, value) => {
        setEditIndex(i)
        setEditValue(value)
        setTimeout(() => editInputRef.current.focus(), 0)
        setIsEditing(true)
    }

    const editSave = (i) => {
        const updatedTaskList = taskList.map((currentTask, index) => {
            if (i === index) {
                return {...currentTask, value: editValue}
            }
            return currentTask
        })

        setTaskList(updatedTaskList)
        setEditValue('')
        setEditIndex(null)
        setIsEditing(false)
    }

    const updateTask = (i) => {
        const updatedTaskList = taskList.map((currentTask, index) => {
            if (index === i) {
                return { value: currentTask.value, status: currentTask.status === 'completed' ? 'uncompleted' : 'completed' }
            }
            return currentTask
        })
        
        setTaskList(updatedTaskList)
    }

    const adaptiveWidth = (value) => {
        return Math.max(value.length + 5, 10) + 'ch'
    }

    const saveTaskList = () => {
        const jsonTaskList = JSON.stringify(taskList, null, 2)
        const blob = new Blob([jsonTaskList], { type: 'application/json' })
        const url = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.download = 'toDoList.json'
        link.href = url
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }
    
    const downloadTaskList = (e) => {
        const file = e.target.files[0]
        if (file) {
            const fileReader = new FileReader()
            fileReader.onload = (e) => {
                try {
                    const jsonTaskList = JSON.parse(e.target.result)
                    setTaskList(jsonTaskList)
                } catch (err) {
                    alert('Ошибка. Проверьте формат файла')
                }
            }
            fileReader.readAsText(file)
        }
    }
    
    const draggingProcess = (i) => {
        setDraggedIndex(i)
        setIsDragging(true)
    }

    const draddingOver = (e) => {
        e.preventDefault()
    }

    const droppingProcess = (index) => {
        if (isEditing === true) return
        
        const updatedTaskList = [...taskList]
        const currentTask = updatedTaskList[draggedIndex]

        updatedTaskList.splice(draggedIndex, 1)
        updatedTaskList.splice(index, 0, currentTask)

        setTaskList(updatedTaskList)
        setDraggedIndex(null)
        setIsDragging(false)
    }

    useEffect(() => {}, [taskList])

    return (
        <div className="container">
            <div className="app">
            <h1>To Do List:</h1>
            <div className="custom-input">
                <input
                    type="text"
                    className="input"
                    value={inputValue}
                    onChange={inputChangeEvent}
                    placeholder="Write task..."
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            addTask()
                        }
                    }}
                />
                <button className="button" onClick={addTask}>New task</button>
            </div>
            <ul>
                {taskList.map((currentTask, i) => {
                    return ( 
                        <div
                            key={i}
                            className={`task-container ${draggedIndex === i && isDragging  ? 'dragging' : ''}`}
                            draggable
                            onDragStart={() => draggingProcess(i)}
                            onDragOver={draddingOver}
                            onDrop={() => droppingProcess(i)}
                            onDragEnd={() => setIsDragging(false)}
                        >
                            <input
                                type="checkbox"
                                checked={currentTask.status === 'completed'}
                                onChange={() => updateTask(i)}
                            />
                            {editIndex === i ? (
                                <input
                                    className="edit-input"
                                    type="text"
                                    style={{width: adaptiveWidth(editValue)}}
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onBlur={() => editSave(i)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            editSave(i)
                                        }
                                    }}
                                    ref={editInputRef}
                                />
                            ) : (
                            <li
                                className={currentTask.status}
                                onClick={() => editProcess(i, currentTask.value)}
                            >
                                {currentTask.value}
                            </li>
                            )}
                            <button onClick={() => deleteTask(i)} className="delete-button"> 
                                <img
                                    src={require('./delete_button.png')}
                                    alt="Button delete"
                                />
                            </button>
                        </div>
                    )
                })}
            </ul>
            <div className="additional-buttons">
                <button className="save-button" onClick={saveTaskList}>
                    Save toDoList
                </button>
                <label
                    htmlFor="download-button"
                    className="custom-download"
                > 
                    Download toDoList
                </label>
                <input
                    className="download-button"
                    id="download-button"
                    type="file"
                    accept=".json"
                    onChange={downloadTaskList}
                />
            </div>
            </div>
        </div>
    )
}

export default App;