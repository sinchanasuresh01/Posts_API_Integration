import { useEffect, useState } from 'react' 
import './App.css' 
 
const POSTS_URL = 'https://dummyjson.com/posts' 
 
function App() { 
  const [posts, setPosts] = useState([]) 
  const [title, setTitle] = useState('') 
  const [body, setBody] = useState('') 
  const [editingPost, setEditingPost] = useState(null) 
  const [isLoading, setIsLoading] = useState(true) 
  const [message, setMessage] = useState('') 
  const [error, setError] = useState('') 
 
  // GET: load a small group of example posts when the page first opens. 
  useEffect(() => { 
    async function loadPosts() {
      try { 
        const response = await fetch(`${POSTS_URL}?limit=10`) 
        if (!response.ok) throw new Error('Could not load posts.') 
        const data = await response.json() 
        setPosts(data.posts) 
      } catch (loadError) { 
        setError(loadError.message) 
      } finally { 
        setIsLoading(false) 
      } 
    } 
 
    loadPosts() 
  }, []) 
 
  // Clear the form and leave edit mode after saving or cancelling. 
  function clearForm() { 
    setTitle('') 
    setBody('') 
    setEditingPost(null) 
  } 
 
  // POST creates a post. DummyJSON returns a sample response but does not save it on its server. 
  async function addPost(event) { 
    event.preventDefault() 
    setError('') 
    setMessage('') 
 
    try { 
      const response = await fetch(`${POSTS_URL}/add`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ title, body, userId: 1 }), 
      }) 
      if (!response.ok) throw new Error('Could not add the post.') 
      const newPost = await response.json() 
      // Add the API response to local React state so it appears in the list right away. 
      setPosts([newPost, ...posts]) 
      clearForm() 
      setMessage('Post added. This demo API does not keep it after a refresh.') 
    } catch (saveError) { 
      setError(saveError.message) 
    } 
  } 
 
  // PATCH changes a post. The API echoes the update; it does not save it permanently. 
  async function updatePost(event) { 
    event.preventDefault() 
    setError('') 
    setMessage('') 
    const changes = { title, body } 
 
    try { 
      const response = await fetch(`${POSTS_URL}/${editingPost.id}`, { 
        method: 'PATCH', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(changes), 
      }) 
      if (!response.ok) throw new Error('Could not update the post.') 
      const savedPost = await response.json() 
      // Replace the edited post in the local React state using its id. 
      setPosts( 
        posts.map((post) => 
          post.id === savedPost.id ? { ...post, ...savedPost } : post, 
        ), 
      ) 
      clearForm() 
      setMessage( 
        'Post updated. This demo API does not keep the change after a refresh.', 
      ) 
    } catch (saveError) { 
      setError(saveError.message) 
    } 
  }
   // Copy a post's values into the form so the user can edit them. 
  function startEditing(post) { 
    setEditingPost(post) 
    setTitle(post.title) 
    setBody(post.body) 
    setMessage('') 
    setError('') 
    window.scrollTo({ top: 0, behavior: 'smooth' }) 
  } 
 
  // DELETE asks the API to delete, then removes the post from the visible list. 
  async function deletePost(id) { 
    if (!window.confirm('Delete this post?')) return 
    setError('') 
    setMessage('') 
 
    try { 
      const response = await fetch(`${POSTS_URL}/${id}`, { method: 'DELETE' }) 
      if (!response.ok) throw new Error('Could not delete the post.') 
      await response.json() 
      setPosts(posts.filter((post) => post.id !== id)) 
      setMessage( 
        'Post deleted from this view. The demo API keeps its original data.', 
      ) 
    } catch (deleteError) { 
      setError(deleteError.message) 
    } 
  } 
 
  return ( 
    <main className="page"> 
      <header className="page-header"> 
        <p className="eyebrow">REACT + REST API</p> 
        <h1>Posts board</h1> 
        <p>Read, create, update, and delete posts with simple API requests.</p> 
      </header> 
 
      <section className="panel form-panel"> 
        <h2>{editingPost ? 'Edit post' : 'Create a post'}</h2> 
        <form onSubmit={editingPost ? updatePost : addPost}> 
          <label htmlFor="post-title">Title</label> 
          <input 
            id="post-title" 
            value={title} 
            onChange={(event) => setTitle(event.target.value)} 
            required 
          /> 
 
          <label htmlFor="post-body">Post text</label> 
          <textarea 
            id="post-body" 
            value={body} 
            onChange={(event) => setBody(event.target.value)} 
            rows="4" 
            required 
          /> 
 
          <div className="form-buttons"> 
            <button className="primary-button" type="submit"> 
              {editingPost ? 'Save changes' : 'Add post'} 
            </button> 
            {editingPost && ( 
              <button 
                className="plain-button" 
                type="button" 
                onClick={clearForm} 
              > 
                Cancel 
              </button> 
            )} 
          </div> 
        </form> 
      </section>
         <p className="api-note"> 
        Demo API: new, edited, and deleted posts only change this page. 
        Refreshing reloads the original posts. 
      </p> 
      {message && ( 
        <p className="message" role="status"> 
          {message} 
        </p> 
      )} 
      {error && ( 
        <p className="error" role="alert"> 
          {error} 
        </p> 
      )} 
 
      <section className="posts-section"> 
        <div className="section-heading"> 
          <h2>Posts</h2> 
          <span>{posts.length} shown</span> 
        </div> 
        {isLoading ? <p className="status">Loading posts…</p> : null} 
        {!isLoading && error && posts.length === 0 ? ( 
          <p className="status">Posts could not be loaded.</p> 
        ) : null} 
        {!isLoading && posts.length === 0 && !error ? ( 
          <p className="status">No posts to show.</p> 
        ) : null} 
        <div className="post-list"> 
          {posts.map((post) => ( 
            <article className="panel post-card" key={post.id}> 
              <div className="post-title-row"> 
                <h3>{post.title}</h3> 
                <span className="post-id">#{post.id}</span> 
              </div> 
              <p>{post.body}</p> 
              <div className="post-actions"> 
                <button 
                  className="plain-button" 
                  onClick={() => startEditing(post)} 
                > 
                  Edit 
                </button> 
                <button 
                  className="plain-button delete-button" 
                  onClick={() => deletePost(post.id)} 
                > 
                  Delete 
                </button> 
              </div> 
            </article> 
          ))} 
        </div> 
      </section> 
    </main> 
  ) 
} 
 
export default App