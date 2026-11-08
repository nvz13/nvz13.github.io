import {
  aboutBadge,
  aboutCurrently,
  activities,
  education,
  interests,
  researchExperiences,
  site,
  skills,
} from '../content/portfolioData';
import { useReveal } from '../lib/motion';
import portrait from '../assets/nia-portrait.jpg';

export default function Dossier() {
  useReveal();

  return (
    <div className="page shell">
      <header className="page-head">
        <div>
          <h1 className="page-title display">
            <small>01 / ABOUT</small>
            THE PERSON
            <br />
            BEHIND IT.
          </h1>
        </div>
        {aboutBadge.length > 0 && (
          <dl className="about-badge mono" aria-label="Quick facts">
            <span className="about-badge__scan" aria-hidden="true" />
            <div className="about-badge__head">[ QUICK FACTS ]</div>
            {aboutBadge.map((item) => (
              <div className="about-badge__row" key={item.label}>
                <dt>{item.label}</dt>
                <dd>
                  {item.live && <span className="about-badge__dot" aria-hidden="true" />}
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </header>

      <div className="dossier">
        <aside className="dossier__aside" data-reveal>
          <div className="id-plate" data-reveal-item>
            <div className="id-plate__visual">
              <img
                className="id-plate__photo"
                src={portrait}
                alt="Portrait of Nia Zagar, with dark hair and bangs, sunglasses pushed up on her head, wearing a pearl necklace and a floral dress"
                width={960}
                height={1200}
                decoding="async"
              />
              <span className="id-plate__scan" aria-hidden="true" />
            </div>
            <div className="id-plate__meta">
              <b>{site.name}</b>
              <span>{site.role}</span>
            </div>
          </div>

          <div className="panel" style={{ padding: 14 }} data-reveal-item>
            <div className="mono mono--sm quiet" style={{ marginBottom: 10 }}>
              [ INTERESTS ]
            </div>
            <div className="chips" style={{ marginTop: 0 }}>
              {interests.map((interest) => (
                <span className="tag" key={interest.label}>
                  {interest.label}
                </span>
              ))}
            </div>
          </div>

          {aboutCurrently && (
            <div className="panel" style={{ padding: 14 }} data-reveal-item>
              <div className="mono mono--sm quiet" style={{ marginBottom: 10 }}>
                [ CURRENTLY ]
              </div>
              <p className="about-currently">
                <span className="about-badge__dot" aria-hidden="true" />
                {aboutCurrently}
              </p>
            </div>
          )}
        </aside>

        <div>
          <section className="dossier__block dossier__block--split">
            <div className="dossier__block-head">
              <div className="block-label">[ 01 / PROFILE ]</div>
              <h2 className="block-title display">STUDENT. CREATIVE. CURIOUS.</h2>
            </div>
            <div className="dossier__block-body">
              <p className="bio-text">
                {site.longBio}
              </p>
            </div>
          </section>

          <section className="dossier__block dossier__block--split" data-reveal>
            <div className="dossier__block-head">
              <div className="block-label">[ 02 / EDUCATION ]</div>
              <h2 className="block-title display">ACADEMIC BACKGROUND</h2>
            </div>
            <div className="dossier__block-body">
              <div className="timeline">
                {education.map((item) => (
                  <div className="tl-item" key={item.degree} data-reveal-item>
                    <span className="tl-period">{item.period}</span>
                    <div>
                      <div className="tl-degree">{item.place}</div>
                      <div className="tl-place">{item.degree}</div>
                      {item.note && <p className="tl-note">{item.note}</p>}
                      {item.courses.length > 0 && (
                        <div className="tl-courses">
                          {item.courses.map((course) => (
                            <span className="tag" key={course}>
                              {course}
                            </span>
                          ))}
                        </div>
                      )}
                      {item.involvement && item.involvement.length > 0 && (
                        <div className="tl-involve">
                          <div className="tl-involve__label">[ INVOLVEMENT ]</div>
                          <ul className="tl-involve__list">
                            {item.involvement.map((entry) => (
                              <li key={entry.name}>
                                <span className="tl-involve__name">{entry.name}</span>
                                {entry.role && (
                                  <>
                                    <span className="tl-involve__sep" aria-hidden="true"> — </span>
                                    <span className="tl-involve__role">{entry.role}</span>
                                  </>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {researchExperiences.map((item) => (
                  <div className="tl-item" key={item.id} data-reveal-item>
                    <span className="tl-period">{item.date}</span>
                    <div>
                      <div className="tl-degree">{item.title}</div>
                      <div className="tl-place">{item.category}</div>
                      <p className="tl-note">{item.description}</p>
                      {item.externalLink && (
                        <a className="ulink mono" href={item.externalLink} target="_blank" rel="noreferrer">
                          OPEN ↗
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="dossier__block dossier__block--split" data-reveal>
            <div className="dossier__block-head">
              <div className="block-label">[ 03 / CAPABILITY ]</div>
              <h2 className="block-title display">SKILLS &amp; TOOLS</h2>
            </div>
            <div className="dossier__block-body">
              {skills.length ? (
                <div className="skill-groups">
                  {skills.map((group) => (
                    <div className="skill-group" key={group.group} data-reveal-item>
                      <div className="skill-group__label">{group.group}</div>
                      <div className="chips skill-group__items">
                        {group.items.map((item) => (
                          <span className="tag" key={item}>
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mono mono--sm quiet">No skills added yet. Add skills in portfolioData.ts.</div>
              )}
            </div>
          </section>

          <section className="dossier__block dossier__block--split" data-reveal>
            <div className="dossier__block-head">
              <div className="block-label">[ 04 / ACTIVITIES ]</div>
              <h2 className="block-title display">ACTIVITIES</h2>
            </div>
            <div className="dossier__block-body">
              <div>
                {activities.length ? (
                  <ul className="tl-involve__list activity-list">
                    {activities.map((activity) => (
                      <li key={activity.id} data-reveal-item>
                        <div className="activity-list__line">
                          {activity.date && <span className="activity-list__date">{activity.date}</span>}
                          <span className="tl-involve__name">{activity.org}</span>
                          {activity.role && (
                            <>
                              <span className="tl-involve__sep" aria-hidden="true"> — </span>
                              <span className="tl-involve__role">{activity.role}</span>
                            </>
                          )}
                          {activity.externalLink && (
                            <a className="ulink mono activity-list__link" href={activity.externalLink} target="_blank" rel="noreferrer">
                              OPEN ↗
                            </a>
                          )}
                        </div>
                        {activity.description && <p className="activity-list__desc">{activity.description}</p>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mono mono--sm quiet">No activities added yet. Add an activity in portfolioData.ts.</div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
