import { NextRequest, NextResponse } from 'next/server';
import { extractTickets } from '@/lib/groq';
import {
  saveExtractedTickets,
  addTicketsToProject,
  updateMeetingSpecs,
  updateMeetingName,
} from '@/lib/db';
import { buildSpeakerMap, extractSpeakerNames } from '@/lib/speaker-match';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { meetingId, projectId, userId, orgId } = body;

  if (!meetingId || !projectId || !userId || !orgId) {
    return NextResponse.json(
      { error: 'meetingId, projectId, userId, orgId required' },
      { status: 400 }
    );
  }

  const fakeTranscript = [
    {
      speaker_name: 'Sarah',
      transcript:
        "Alright let's kick off sprint planning. I'll take notes and assign tickets as we go.",
    },
    {
      speaker_name: 'CEO',
      transcript:
        "Let's focus on shipping the core product this sprint. I want the landing page and onboarding flow ready for beta users.",
    },
    {
      speaker_name: 'CEO',
      transcript:
        'I finished the investor pitch deck yesterday. I also completed the competitive analysis document.',
    },
    {
      speaker_name: 'CEO',
      transcript: "I need to write the go-to-market strategy. I'll have a draft by next Wednesday.",
    },
    {
      speaker_name: 'Sarah',
      transcript:
        "Nice. I started the dashboard UI but it's not done yet. I'll have it finished by Friday.",
    },
    {
      speaker_name: 'Sarah',
      transcript:
        "I also want to add empty states for all the list views. I'll do that by Thursday.",
    },
    {
      speaker_name: 'Sarah',
      transcript: 'The loading skeletons are done, I pushed those this morning.',
    },
    {
      speaker_name: 'Sarah',
      transcript:
        "I'll handle the notification center UI after the dashboard is done. Probably by next Tuesday.",
    },
    {
      speaker_name: 'Sarah',
      transcript:
        "I need to do a full accessibility audit of the app. I'll run the screen reader tests by next week.",
    },
    {
      speaker_name: 'Sarah',
      transcript: 'The keyboard shortcuts documentation is done, I added it to the wiki.',
    },
    {
      speaker_name: 'CTO',
      transcript:
        "On the backend, I'll handle the API endpoints by Friday. I need to set up user routes, auth middleware, and the session management flow.",
    },
    {
      speaker_name: 'CTO',
      transcript:
        "I also need to build the password reset endpoint. I'll do that over the weekend, done by Monday.",
    },
    {
      speaker_name: 'CTO',
      transcript: 'The email verification service is done, I deployed it yesterday.',
    },
    {
      speaker_name: 'CTO',
      transcript:
        'I can help with the API rate limiting after I finish the auth middleware. Probably by next week.',
    },
    {
      speaker_name: 'CTO',
      transcript: 'The webhook handler for Stripe payments is done, I tested it in staging.',
    },
    {
      speaker_name: 'CTO',
      transcript:
        "I still need to build the subscription management endpoints. I'll get to that by next Wednesday.",
    },
    {
      speaker_name: 'CTO',
      transcript:
        'The search indexing service is done, Elasticsearch is configured and indexing works.',
    },
    {
      speaker_name: 'CTO',
      transcript:
        "I need to build the admin panel API routes. That's a big task, I'll start on it next week and have it by the week after.",
    },
    {
      speaker_name: 'CTO',
      transcript:
        "I need to write integration tests for the auth flow. I'll have those by next Friday.",
    },
    {
      speaker_name: 'Mike',
      transcript:
        "I'm blocked on the database schema, waiting on CTO to finalize the user table structure before I can build the migrations.",
    },
    {
      speaker_name: 'Mike',
      transcript: "Once the schema is ready I'll have the migrations done by Wednesday.",
    },
    {
      speaker_name: 'Mike',
      transcript:
        "I also need to set up the backup strategy for production. I'll have that configured by next Friday.",
    },
    {
      speaker_name: 'Mike',
      transcript: "The Redis cache layer is done, it's deployed and working.",
    },
    {
      speaker_name: 'Mike',
      transcript:
        "I'm waiting on the DevOps team to provision the staging database before I can run the seed scripts.",
    },
    {
      speaker_name: 'Mike',
      transcript: 'The CI/CD pipeline is set up, builds are running on every PR.',
    },
    {
      speaker_name: 'Mike',
      transcript:
        "I need to configure the monitoring and alerting for production. I'll have Datadog set up by next Tuesday.",
    },
    {
      speaker_name: 'Mike',
      transcript:
        "I'm also working on the Docker container optimization. The image size is too large, I'll slim it down by Thursday.",
    },
    {
      speaker_name: 'Mike',
      transcript:
        'The database indexing strategy is done, I added indexes on all the foreign keys.',
    },
    {
      speaker_name: 'Mike',
      transcript:
        "I still need to set up the read replica for the analytics queries. I'll have that by next Monday.",
    },
    {
      speaker_name: 'Founder',
      transcript:
        'I completed the brand guidelines document yesterday. Logo usage, color palette, typography — all documented.',
    },
    {
      speaker_name: 'Founder',
      transcript:
        "I'm working on the marketing site copy. I'll have the homepage and features page done by Thursday.",
    },
    {
      speaker_name: 'Founder',
      transcript:
        "I need to set up the customer feedback survey. I'll have it deployed by tomorrow.",
    },
    {
      speaker_name: 'Founder',
      transcript: 'The API documentation is done, I wrote the OpenAPI spec and published it.',
    },
    {
      speaker_name: 'Founder',
      transcript:
        "I'm blocked on the pricing page because I need the competitor pricing analysis from CEO. Waiting on that.",
    },
    {
      speaker_name: 'Founder',
      transcript:
        "I also need to create the changelog template for releases. I'll have that by next Monday.",
    },
    {
      speaker_name: 'Founder',
      transcript:
        'The user onboarding emails are done, I configured the drip campaign in SendGrid.',
    },
    {
      speaker_name: 'Founder',
      transcript:
        "I still need to write the technical blog post about our architecture. I'll publish it next week.",
    },
    {
      speaker_name: 'CEO',
      transcript:
        "I'm blocked on the partnership agreement — waiting on legal to review the contract terms.",
    },
    {
      speaker_name: 'CEO',
      transcript: "I need to finalize the beta tester list. I'll have that curated by tomorrow.",
    },
    {
      speaker_name: 'CEO',
      transcript: 'The user interview notes from last week are compiled, I shared them in Notion.',
    },
  ];

  const transcript = fakeTranscript.map((t) => `${t.speaker_name}: ${t.transcript}`).join('\n');

  const { tickets, title } = await extractTickets(transcript, meetingId);

  const spokenNames = extractSpeakerNames(fakeTranscript);
  const speakerMap = await buildSpeakerMap(projectId, spokenNames);

  const ticketsWithUser = tickets.map((ticket: any) => {
    let assignee = ticket.assignee ?? null;
    let assignee_user_id = ticket.assignee_user_id ?? null;

    if (assignee && !assignee_user_id) {
      const match = speakerMap.get(assignee);
      if (match?.matchedUserId) {
        assignee = match.matchedName;
        assignee_user_id = match.matchedUserId;
      } else {
        for (const [spokenName, matchInfo] of speakerMap.entries()) {
          if (matchInfo.matchedUserId) {
            const spokenNorm = spokenName.toLowerCase();
            const assigneeNorm = assignee.toLowerCase();
            if (spokenNorm.includes(assigneeNorm) || assigneeNorm.includes(spokenNorm)) {
              assignee = matchInfo.matchedName;
              assignee_user_id = matchInfo.matchedUserId;
              break;
            }
          }
        }
      }
    }

    return {
      ...ticket,
      user_id: userId,
      org_id: orgId,
      projectId,
      project_id: projectId,
      assignee,
      assignee_user_id,
    };
  });

  const insertedTickets = await saveExtractedTickets(ticketsWithUser);
  await updateMeetingSpecs(meetingId, transcript, insertedTickets.length);
  await updateMeetingName(meetingId, title);

  if (projectId) {
    await addTicketsToProject(
      projectId,
      insertedTickets.map((t: any) => t.id)
    );
  }

  return NextResponse.json({
    success: true,
    title,
    speakerMap: Object.fromEntries(
      [...speakerMap.entries()].map(([k, v]) => [
        k,
        { name: v.matchedName, userId: v.matchedUserId },
      ])
    ),
    tickets: insertedTickets.map((t: any) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      assignee: t.assignee,
      assignee_user_id: t.assignee_user_id,
      due_date: t.due_date,
    })),
  });
}
