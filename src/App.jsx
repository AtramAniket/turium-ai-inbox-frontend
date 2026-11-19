import { useEffect, useState } from 'react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'

function App() {
  const [sourceType, setSourceType] = useState('note')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [items, setItems] = useState([])
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState(null)
  const [message, setMessage] = useState(null)
  const [saving, setSaving] = useState(false)
  const [asking, setAsking] = useState(false)

  async function loadItems() {
    try {
      const response = await fetch(`${API_BASE}/items`)
      if (!response.ok) throw new Error('Could not load saved items.')
      setItems(await response.json())
    } 
    catch (error) {
      setMessage({ type: 'error', text: error.message })
    }
  }

  useEffect(() => {
    async function loadInitialItems() {
      try {
        const response = await fetch(`${API_BASE}/items`)
        if (!response.ok) throw new Error('Could not load saved items.')

        setItems(await response.json())
      } 
      catch (error) {
        setMessage({ type: 'error', text: error.message })
      }
    }

    loadInitialItems()
  }, [])

  async function ingest(event) {
    event.preventDefault()
    setSaving(true); setMessage(null)
    
    const payload = sourceType === 'note'
      ? { source_type: 'note', title: title || undefined, content }
      : { source_type: 'url', title: title || undefined, url: content }
    
    try {
      const response = await fetch(`${API_BASE}/ingest/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body.detail || 'Could not save this item.')
      setItems((current) => [body, ...current])
      setTitle(''); setContent('')
      setMessage({ type: 'success', text: 'Saved to your inbox.' })
    } 
    catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally { setSaving(false) }
  }

  async function ask(event) {
    event.preventDefault()
    setAsking(true); setAnswer(null); setMessage(null)
    try {
      const response = await fetch(`${API_BASE}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body.detail || 'Could not answer that question.')
      setAnswer(body)
    } 
    catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally { setAsking(false) }
  }

  return (
    <main className="app">
      <header>
        <p className="eyebrow">Turium</p>
        <h1>Knowledge Inbox</h1>
        <p className="subtitle">Save useful things. Ask questions when you need them.</p>
      </header>

      {message && <p className={`message ${message.type}`} role="status">{message.text}</p>}

      <section className="panel" aria-labelledby="save-heading">
        <h2 id="save-heading">Save something</h2>
        <form onSubmit={ingest}>
          <fieldset className="source-options">
            <legend>Source type</legend>
            <label><input type="radio" checked={sourceType === 'note'} onChange={() => setSourceType('note')} /> Note</label>
            <label><input type="radio" checked={sourceType === 'url'} onChange={() => setSourceType('url')} /> URL</label>
          </fieldset>
          <label>Title <span className="optional">(optional)</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Give this a useful name" /></label>
          <label>{sourceType === 'note' ? 'Note' : 'URL'}{sourceType === 'note'
            ? <textarea required value={content} onChange={(event) => setContent(event.target.value)} placeholder="Write or paste your note" rows="5" />
            : <input required type="url" value={content} onChange={(event) => setContent(event.target.value)} placeholder="https://example.com/article" />}</label>
          <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save item'}</button>
        </form>
      </section>

      <section className="panel" aria-labelledby="items-heading">
        <div className="section-heading"><h2 id="items-heading">Saved items</h2><button className="secondary" onClick={loadItems}>Refresh</button></div>
        {items.length === 0 ? <p className="empty">No saved items yet.</p> : <ul className="items">{items.map((item) => <li key={item.id}><div><strong>{item.title}</strong><span>{item.source_type === 'url' ? 'URL' : 'Note'} · {item.status}</span></div>{item.source_url && <a href={item.source_url} target="_blank" rel="noreferrer">Open source</a>}</li>)}</ul>}
      </section>

      <section className="panel" aria-labelledby="question-heading">
        <h2 id="question-heading">Ask your inbox</h2>
        <form onSubmit={ask}><label>Question<textarea required value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="What would you like to know?" rows="3" /></label><button type="submit" disabled={asking}>{asking ? 'Finding an answer…' : 'Ask question'}</button></form>
        {answer && <article className="answer"><h3>Answer</h3><p>{answer.answer}</p><h3>Sources</h3>{answer.citations?.length ? <ol className="citations">{answer.citations.map((citation, index) => <li key={`${citation.item_id}-${citation.chunk_index}-${index}`}><strong>{citation.title}</strong><p>{citation.content}</p>{citation.source_url && <a href={citation.source_url} target="_blank" rel="noreferrer">View original source</a>}</li>)}</ol> : <p className="empty">No sources were returned.</p>}</article>}
      </section>
    </main>
  )
}

export default App
