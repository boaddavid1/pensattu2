export default function Trail() {
  const items = ['Sunday Worship', 'Community Groups', 'Youth Ministry', 'Prayer Nights', 'Outreach', 'Bible Study'];
  const track = [...items, ...items];
  return (
    <div className="trail-strip">
      <div className="trail-track">
        {track.map((item, i) => <span key={i}>{item}</span>)}
      </div>
    </div>
  );
}
