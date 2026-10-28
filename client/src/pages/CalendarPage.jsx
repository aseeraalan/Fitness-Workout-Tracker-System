import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { AppHeader } from '../components/AppHeader.jsx';
import {
  addMonths,
  groupByDate,
  monthGrid,
  monthTitle,
  visibleRange,
  weekdayLabels,
} from '../calendarUtils.js';
import { calendarPath, newSessionPath, newWorkoutPath, withReturnTo } from '../navigation.js';
import { isValidWorkoutDate, localDateString } from '@shared/workoutRules.js';
import { formatWorkoutDate } from '../validation.js';

function currentMonth() {
  const now = new Date();
  return { year: now.getFullYear(), monthIndex: now.getMonth() };
}

function monthFromDateString(value) {
  if (!isValidWorkoutDate(value)) return currentMonth();
  const [year, month] = value.split('-').map(Number);
  return { year, monthIndex: month - 1 };
}

export function CalendarPage() {
  const { client } = useAuth();
  const [params, setParams] = useSearchParams();
  const today = localDateString();
  const requestedDate = params.get('date');
  const selectedDate = isValidWorkoutDate(requestedDate) ? requestedDate : today;
  const [{ year, monthIndex }, setMonth] = useState(() => monthFromDateString(selectedDate));
  const [data, setData] = useState({ workouts: [], sessions: [] });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const cells = useMemo(() => monthGrid(year, monthIndex), [year, monthIndex]);
  const range = useMemo(() => visibleRange(cells), [cells]);

  useEffect(() => {
    const next = monthFromDateString(selectedDate);
    setMonth((current) =>
      current.year === next.year && current.monthIndex === next.monthIndex ? current : next
    );
  }, [selectedDate]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const result = await client.listCalendar({ from: range.from, to: range.to });
        if (cancelled) return;
        setData({ workouts: result.workouts || [], sessions: result.sessions || [] });
        setLoadError('');
      } catch (error) {
        if (cancelled) return;
        setLoadError(error.payload?.message || error.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client, range.from, range.to]);

  const workoutsByDate = groupByDate(data.workouts);
  const sessionsByDate = groupByDate(data.sessions);
  const selectedWorkouts = workoutsByDate[selectedDate] || [];
  const selectedSessions = sessionsByDate[selectedDate] || [];
  const returnTo = calendarPath(selectedDate);

  function selectDate(dateString) {
    setParams({ date: dateString });
    const next = monthFromDateString(dateString);
    setMonth(next);
  }

  function moveMonth(delta) {
    const next = addMonths(year, monthIndex, delta);
    const now = currentMonth();
    const first = `${next.year}-${String(next.monthIndex + 1).padStart(2, '0')}-01`;
    const dateString = next.year === now.year && next.monthIndex === now.monthIndex ? today : first;
    setMonth(next);
    setParams({ date: dateString });
  }

  function goToday() {
    const now = currentMonth();
    setMonth(now);
    setParams({ date: today });
  }

  function onGridKeyDown(event) {
    const index = cells.findIndex((cell) => cell.dateString === selectedDate);
    if (index < 0) return;
    const moves = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    const delta = moves[event.key];
    if (delta === undefined) return;
    event.preventDefault();
    const next = cells[index + delta];
    if (next) {
      selectDate(next.dateString);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      moveMonth(-1);
    } else {
      moveMonth(1);
    }
  }

  return (
    <div className="page calendar-page">
      <AppHeader title="Calendar" headingLevel="h1" />
      <main className="profile-card" style={{ padding: '1.5rem' }}>
        <div className="section-heading">
          <p className="lede" style={{ marginBottom: 0 }}>
            Scheduled gym sessions and logged workouts for the visible month. Dates are calendar
            days, not converted through time zones.
          </p>
        </div>

        <div className="legend" aria-label="Calendar legend">
          <span className="cal-pill cal-pill-session">Scheduled session</span>
          <span className="cal-pill cal-pill-workout">Logged workout</span>
        </div>

        <div className="calendar-toolbar">
          <button type="button" className="button-secondary" onClick={() => moveMonth(-1)}>
            Previous month
          </button>
          <h2>{monthTitle(year, monthIndex)}</h2>
          <button type="button" className="button-secondary" onClick={goToday}>
            Today
          </button>
          <button type="button" className="button-secondary" onClick={() => moveMonth(1)}>
            Next month
          </button>
        </div>

        {loadError ? (
          <p className="form-error" role="alert">
            {loadError}
          </p>
        ) : null}

        {loading ? (
          <div className="center" role="status" aria-live="polite">
            <div className="spinner" />
          </div>
        ) : (
          <div className="calendar-grid-wrap">
            <div
              className="calendar-grid"
              role="grid"
              aria-label={`${monthTitle(year, monthIndex)} calendar`}
              onKeyDown={onGridKeyDown}
            >
              {weekdayLabels().map((label) => (
                <div key={label} role="columnheader" className="calendar-weekday">
                  {label}
                </div>
              ))}
              {cells.map((cell) => {
                const sessions = sessionsByDate[cell.dateString] || [];
                const workouts = workoutsByDate[cell.dateString] || [];
                const selected = cell.dateString === selectedDate;
                const isToday = cell.dateString === today;
                return (
                  <button
                    key={cell.dateString}
                    type="button"
                    role="gridcell"
                    className={`calendar-cell${cell.inMonth ? '' : ' is-outside'}${selected ? ' is-selected' : ''}${isToday ? ' is-today' : ''}`}
                    tabIndex={selected ? 0 : -1}
                    aria-selected={selected}
                    aria-current={isToday ? 'date' : undefined}
                    aria-label={`${formatWorkoutDate(cell.dateString)}: ${sessions.length} scheduled, ${workouts.length} logged`}
                    onClick={() => selectDate(cell.dateString)}
                  >
                    <span className="calendar-daynum">{cell.day}</span>
                    <span className="calendar-markers">
                      {sessions.length > 0 ? (
                        <span className="cal-dot cal-dot-session">S {sessions.length}</span>
                      ) : null}
                      {workouts.length > 0 ? (
                        <span className="cal-dot cal-dot-workout">W {workouts.length}</span>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <section className="day-panel" aria-live="polite">
          <h2>{formatWorkoutDate(selectedDate)}</h2>
          {selectedSessions.length === 0 && selectedWorkouts.length === 0 ? (
            <div className="empty-state">
              <p>No sessions or workouts on this day.</p>
            </div>
          ) : (
            <>
              {selectedSessions.map((session) => (
                <article key={session.id} className="day-item">
                  <p className="cal-pill cal-pill-session">Scheduled session</p>
                  <h3>
                    {session.startTime ? `${session.startTime} · ` : ''}
                    {session.title}
                  </h3>
                  <div className="inline-actions">
                    <Link className="button button-primary" to={withReturnTo(`/sessions/${session.id}`, returnTo)}>
                      View
                    </Link>
                    <Link
                      className="button button-secondary"
                      to={withReturnTo(`/sessions/${session.id}/edit`, returnTo)}
                    >
                      Edit
                    </Link>
                  </div>
                </article>
              ))}
              {selectedWorkouts.map((workout) => (
                <article key={workout.id} className="day-item">
                  <p className="cal-pill cal-pill-workout">Logged workout</p>
                  <h3>{workout.title}</h3>
                  <div className="inline-actions">
                    <Link className="button button-primary" to={withReturnTo(`/workouts/${workout.id}`, returnTo)}>
                      View
                    </Link>
                    <Link
                      className="button button-secondary"
                      to={withReturnTo(`/workouts/${workout.id}/edit`, returnTo)}
                    >
                      Edit
                    </Link>
                  </div>
                </article>
              ))}
            </>
          )}
          <div className="inline-actions">
            <Link className="button button-primary" to={newSessionPath(selectedDate, returnTo)}>
              Schedule a session
            </Link>
            <Link className="button button-secondary" to={newWorkoutPath(selectedDate, returnTo)}>
              Log a workout
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
