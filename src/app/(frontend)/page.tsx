"use client"

import React, { useState, useEffect, useCallback } from 'react'

type Todo = {
  id: number
  title: string
  description?: string
  completed: boolean
  date: string
}

export default function HomePage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [search, setSearch] = useState('')

  // Date state (YYYY-MM-DD)
  const [currentDate, setCurrentDate] = useState(() => new Date().toISOString().split('T')[0])

  // Copy Dialog States
  const [showCopyDialog, setShowCopyDialog] = useState(false)
  const [isCopying, setIsCopying] = useState(false)
  const [copySourceDate, setCopySourceDate] = useState(() => new Date().toISOString().split('T')[0])
  const [sourceTasks, setSourceTasks] = useState<Todo[]>([])
  const [loadingSourceTasks, setLoadingSourceTasks] = useState(false)
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([])
  const [adHocTasks, setAdHocTasks] = useState<string[]>([])
  const [newAdHocInput, setNewAdHocInput] = useState('')

  const fetchTodos = useCallback(async (dateToFetch: string) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/todos?where[date][equals]=${dateToFetch}&limit=100&sort=-createdAt`)
      const data = await res.json()
      if (data.docs) {
        setTodos(data.docs)
      }
    } catch (error) {
      console.error('Failed to fetch todos:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch current date's todos
  useEffect(() => {
    fetchTodos(currentDate)
  }, [currentDate, fetchTodos])

  // Fetch source date's todos when copy dialog is open or copySourceDate changes
  useEffect(() => {
    if (!showCopyDialog) return

    const fetchSource = async () => {
      try {
        setLoadingSourceTasks(true)
        const res = await fetch(`/api/todos?where[date][equals]=${copySourceDate}&limit=100&sort=-createdAt`)
        const data = await res.json()
        if (data.docs) {
          setSourceTasks(data.docs)
          // Automatically select tasks that don't already exist in current day
          const validIds = data.docs
            .filter((t: Todo) => !todos.some(existing => existing.title.toLowerCase().trim() === t.title.toLowerCase().trim()))
            .map((t: Todo) => t.id)
          setSelectedTaskIds(validIds)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoadingSourceTasks(false)
      }
    }
    fetchSource()
  }, [showCopyDialog, copySourceDate, todos])

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const newTask = { title, completed: false, date: currentDate }
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      })
      const data = await res.json()
      if (data.doc) {
        setTodos([data.doc, ...todos])
        setTitle('')
      }
    } catch (error) {
      console.error('Error adding todo:', error)
    }
  }

  const toggleTodo = async (id: number, currentStatus: boolean) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !currentStatus } : t))
    try {
      await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentStatus }),
      })
    } catch (error) {
      setTodos(todos.map(t => t.id === id ? { ...t, completed: currentStatus } : t))
    }
  }

  const deleteTodo = async (id: number) => {
    setTodos(todos.filter(t => t.id !== id))
    try {
      await fetch(`/api/todos/${id}`, { method: 'DELETE' })
    } catch (error) {
      fetchTodos(currentDate)
    }
  }

  const changeDate = (days: number) => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() + days)
    setCurrentDate(d.toISOString().split('T')[0])
  }

  const toggleSourceTaskSelection = (id: number) => {
    if (selectedTaskIds.includes(id)) {
      setSelectedTaskIds(selectedTaskIds.filter(tId => tId !== id))
    } else {
      setSelectedTaskIds([...selectedTaskIds, id])
    }
  }

  const addAdHocTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAdHocInput.trim()) return
    setAdHocTasks([...adHocTasks, newAdHocInput.trim()])
    setNewAdHocInput('')
  }

  const removeAdHocTask = (index: number) => {
    setAdHocTasks(adHocTasks.filter((_, i) => i !== index))
  }

  const handleCopySubmit = async () => {
    if (selectedTaskIds.length === 0 && adHocTasks.length === 0) {
      alert("Bạn chưa chọn công việc nào để chép")
      return
    }

    setIsCopying(true)
    try {
      const selectedTasksToCopy = sourceTasks.filter(t => selectedTaskIds.includes(t.id))

      const promises: Promise<any>[] = []

      // Submit copied tasks
      selectedTasksToCopy.forEach(t => {
        promises.push(fetch('/api/todos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: t.title,
            description: t.description,
            completed: false,
            date: currentDate
          }),
        }))
      })

      // Submit ad-hoc tasks
      adHocTasks.forEach(title => {
        promises.push(fetch('/api/todos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title,
            completed: false,
            date: currentDate
          }),
        }))
      })

      await Promise.all(promises)
      fetchTodos(currentDate)
      closeCopyDialog()
    } catch (error) {
      console.error("Lỗi khi chép việc:", error)
    } finally {
      setIsCopying(false)
    }
  }

  const closeCopyDialog = () => {
    setShowCopyDialog(false)
    setAdHocTasks([])
    setNewAdHocInput('')
  }

  const filteredTodos = todos.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase())
    if (!matchesSearch) return false

    if (filter === 'active') return !t.completed
    if (filter === 'completed') return t.completed
    return true
  })

  return (
    <>
      <div className="app-container">
        <div className="date-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', width: '100%' }}>
            <button className="btn-icon nav-btn" onClick={() => changeDate(-1)}>◀</button>
            <input 
              type="date" 
              className="date-picker-main"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              style={{ margin: 0 }}
            />
            <button className="btn-icon nav-btn" onClick={() => changeDate(1)}>▶</button>
          </div>
          <p className="subtitle" style={{ marginTop: '0.5rem', marginBottom: 0 }}>Quản lý công việc</p>
        </div>

        <form className="todo-form" onSubmit={addTodo} style={{ marginBottom: '1rem' }}>
          <input 
            type="text" 
            className="todo-input" 
            placeholder="Thêm công việc mới" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button type="submit" className="add-btn" disabled={!title.trim()}>Thêm</button>
        </form>

        <div className="copy-section" style={{ marginBottom: '2rem', justifyContent: 'flex-start' }}>
          <button 
            className="filter-btn" 
            style={{ width: '100%', padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderStyle: 'dashed' }} 
            onClick={() => setShowCopyDialog(true)}
          >
            <span style={{ fontSize: '1.2rem' }}>📥</span> Nhập danh sách công việc từ ngày khác
          </button>
        </div>

        <div className="controls">
    <input
      type="text"
      className="search-input"
      placeholder="Tìm kiếm"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
    <div className="filters">
      <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Tất cả</button>
      <button className={`filter-btn ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>Chưa xong</button>
      <button className={`filter-btn ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>Đã xong</button>
    </div>
  </div>

  {
    loading ? (
      <div className="loading">Đang tải danh sách công việc</div>
    ) : filteredTodos.length > 0 ? (
      <ul className="todo-list">
        {filteredTodos.map(todo => (
          <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
            <div className="todo-content">
              <input
                type="checkbox"
                className="todo-checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id, todo.completed)}
              />
              <span className="todo-title">{todo.title}</span>
            </div>
            <div className="todo-actions">
              <button className="btn-icon delete" onClick={() => deleteTodo(todo.id)} title="Xóa">
                🗑️
              </button>
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <div className="empty-state">
        <p>{search ? 'Không tìm thấy công việc nào phù hợp' : 'Ngày này thật thảnh thơi. Bắt đầu việc mới thôi!'}</p>
      </div>
    )
  }
  </div >

    {/* MODAL POPUP */ }
  {
    showCopyDialog && (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Nhập Việc Ngày Khác</h2>
            <button className="btn-icon" onClick={closeCopyDialog}>✖</button>
          </div>

          <div className="modal-body">
            <div className="modal-date-selector">
              <span>Chọn ngày lấy:</span>
              <input
                type="date"
                className="date-picker-small"
                value={copySourceDate}
                onChange={(e) => setCopySourceDate(e.target.value)}
              />
            </div>

            {loadingSourceTasks ? (
              <div className="loading">Đang tải</div>
            ) : sourceTasks.length > 0 ? (
              <ul className="source-task-list">
                {sourceTasks.map(todo => {
                  const exists = todos.some(existing => existing.title.toLowerCase().trim() === todo.title.toLowerCase().trim())
                  return (
                    <li key={todo.id} className={`source-task-item ${exists ? 'disabled' : ''}`}>
                      <input
                        type="checkbox"
                        className="todo-checkbox"
                        checked={selectedTaskIds.includes(todo.id)}
                        disabled={exists}
                        onChange={() => toggleSourceTaskSelection(todo.id)}
                      />
                      <span className="todo-title" style={{ opacity: exists ? 0.5 : 1 }}>
                        {todo.title} {exists && <small>(Đã có)</small>}
                      </span>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="empty-state">Không có công việc nào trong ngày này.</div>
            )}

            <hr className="modal-divider" />

            <div className="adhoc-tasks">
              <h4>Thêm việc mới phát sinh:</h4>
              <form onSubmit={addAdHocTask} className="adhoc-form">
                <input
                  type="text"
                  className="todo-input adhoc-input"
                  placeholder="Nhập việc và ấn Enter..."
                  value={newAdHocInput}
                  onChange={(e) => setNewAdHocInput(e.target.value)}
                />
                <button type="submit" className="add-btn adhoc-btn" disabled={!newAdHocInput.trim()}>+</button>
              </form>
              {adHocTasks.length > 0 && (
                <ul className="adhoc-list">
                  {adHocTasks.map((title, idx) => (
                    <li key={idx} className="adhoc-item">
                      <span className="todo-title">{title}</span>
                      <button className="btn-icon" onClick={() => removeAdHocTask(idx)}>✖</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button className="filter-btn" onClick={closeCopyDialog}>Hủy</button>
            <button className="add-btn confirm-copy-btn" onClick={handleCopySubmit} disabled={isCopying} style={{ background: 'var(--success)' }}>
              {isCopying ? "Đang xử lý" : `Xác nhận (${selectedTaskIds.length + adHocTasks.length} việc)`}
            </button>
          </div>
        </div>
      </div>
    )
  }
    </>
  )
}
