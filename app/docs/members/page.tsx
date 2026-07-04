export default function MembersPage() {
  return (
    <>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>
        Members
      </p>
      <h1
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '2.25rem',
          fontWeight: 700,
          color: '#fff',
          marginBottom: '0.5rem',
          letterSpacing: '-0.03em',
        }}
      >
        Members
      </h1>
      <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem' }}>
        Admins can manage organization members from the Members view in the dashboard. See all
        members, their roles, and when they joined. Remove members or change roles.
      </p>
      <p>
        Within a project, the Members tab (admin only) shows which organization members are part of
        the project. Add or remove project members.
      </p>
    </>
  );
}
