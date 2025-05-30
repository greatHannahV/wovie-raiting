import { useEffect, useRef, useState } from 'react'
import StarRating from './StarRating'
import { useMovies } from './useMovies'
import { useLocalStorageState } from './useLocalStarageState'
import { useKey } from './useKey'
const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0)

const KEY = `f0bbe3c`

export default function App() {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const { movies, isLoading, error, setError } = useMovies(
    query,
    // handleCloseMovie,
  )
  const [watched, setWatched] = useLocalStorageState([], 'watched')

  // const [watched, setWatched] = useState([])
  // const [watched, setWatched] = useState(function () {
  //   const storedValue = localStorage.getItem('watched')
  //   return JSON.parse(storedValue)
  // })

  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id))
  }

  function handleCloseMovie() {
    setSelectedId(null)
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie])
    // localStorage.setItem('watched', JSON.stringify([...watched, movie]))
  }
  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id))
  }
  // useEffect(
  //   function () {
  //     localStorage.setItem('watched', JSON.stringify(watched))
  //   },
  //   [watched],
  // )

  // useEffect(function () {
  //   fetch(`http://www.omdbapi.com/?i=tt3896198&apikey=${KEY}&s=zootopia`)
  //     .then((res) => res.json())
  //     .then((data) => setMovies(data.Search))
  // }, [])

  return (
    <div>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>

      <Main>
        <Box>
          {error && <ErrorMessage message={error} />}
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList
              onSelectMovie={handleSelectMovie}
              setSelectedId={setSelectedId}
              movies={movies}
            />
          )}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              setError={setError}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList
                onDeleteWatched={handleDeleteWatched}
                watched={watched}
              />
            </>
          )}
        </Box>
      </Main>
    </div>
  )
}

function Loader() {
  return <p className="loader">Loading...</p>
}
function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>🌋</span>
      {message}
    </p>
  )
}
function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  )
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>TakePopcorn</h1>
    </div>
  )
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies?.length}</strong> results
    </p>
  )
}

function Search({ query, setQuery }) {
  const inputEl = useRef(null)

  // useEffect(function () {
  //   document.querySelector('search').focus()
  // }, [])

  useKey(function () {
    if (document.activeElement === inputEl.current) return
    inputEl.current.focus()
    setQuery('')
  }, 'Enter')

  // useEffect(
  //   function () {
  //     function callback(e) {
  //       if (document.activeElement === inputEl.current) return
  //       if (e.code === 'Enter') inputEl.current.focus()
  //       setQuery('')
  //     }

  //     document.addEventListener('keydown', callback)
  //     return () => document.addEventListener('keydown', callback)
  //   },
  //   [setQuery],
  // )

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  )
}

function Main({ children }) {
  return <main className="main">{children}</main>
}
function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? '–' : '+'}
      </button>
      {isOpen && children}
    </div>
  )
}

function MovieList({ movies, onSelectMovie }) {
  return (
    <>
      {movies && movies.length > 0 ? (
        <ul className="list list-movies">
          {movies?.map((movie) => (
            <Movie
              movie={movie}
              key={movie.imdbID}
              onSelectMovie={onSelectMovie}
            />
          ))}
        </ul>
      ) : (
        <h1 className="error">Start searching a movie</h1>
      )}
    </>
  )
}

function Movie({ movie, onSelectMovie }) {
  return (
    <li key={movie.imdbID} onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  )
}

function MovieDetails({
  selectedId,
  onCloseMovie,
  setError,
  onAddWatched,
  watched,
}) {
  const [movie, setMovie] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [userRating, setUserRating] = useState('')

  const countRef = useRef(0)

  useEffect(
    function () {
      if (userRating) countRef.current += 1
    },
    [userRating],
  )

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId)
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId,
  )?.userRating
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(' ').at(0)),
      userRating,
      countRatingDecisions: countRef.current,
    }
    onAddWatched(newWatchedMovie)
    onCloseMovie()
  }
  useKey(onCloseMovie, 'Escape')
  // useEffect(
  //   function () {
  //     function callback(e) {
  //       if (e.code === 'Escape') {
  //         onCloseMovie()
  //       }
  //     }
  //     document.addEventListener('keydown', callback)
  //     return function () {
  //       document.removeEventListener('keydown', callback)
  //     }
  //   },
  //   [onCloseMovie],
  // )
  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true)
        setError('')
        try {
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`,
          )
          if (!res.ok) throw new Error('Movie details have not been found')
          const data = await res.json()
          if (data.Response === false) throw new Error('Movie not found')
          setMovie(data)
        } catch (err) {
          setError(err.message)
        } finally {
          setIsLoading(false)
        }
      }
      getMovieDetails()
    },
    [selectedId, setError],
  )

  useEffect(
    function () {
      if (!title) return
      document.title = `Movie | ${title}`
      return function () {
        document.title = 'TakePopcorn'
      }
    },
    [title],
  )

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={` Poster of {movie}`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>
                  {' '}
                  You rated this movie <span>⭐</span>
                  {watchedUserRating}
                </p>
              )}
            </div>
            <p>
              <em>{plot}</em>
              <p>Starring {actors}</p>
              <p>Directed by {director}</p>
            </p>
          </section>
        </>
      )}
    </div>
  )
}
function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating))
  const avgUserRating = average(watched.map((movie) => movie.userRating))
  const avgRuntime = average(watched.map((movie) => movie.runtime))

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  )
}

function WatchedMovieList({ watched, onDeleteWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onDeleteWatched={onDeleteWatched}
        />
      ))}
    </ul>
  )
}
function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => onDeleteWatched(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  )
}
