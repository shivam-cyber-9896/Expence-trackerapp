import Breadcrumb from './Breadcrumb';

export const PageHeader = ({ title, subtitle, action }) => {
  return (
    <div style={styles.container}>
      <Breadcrumb />
      <div style={styles.main}>
        <div style={styles.titleBlock}>
          <h1 style={styles.title}>{title}</h1>
          {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
        </div>
        {action && <div style={styles.actionBlock}>{action}</div>}
      </div>
    </div>
  );
};

const styles = {
  container: {
    marginBottom: '24px',
    textAlign: 'left',
    width: '100%',
  },
  main: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  titleBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: 'var(--text-main)',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    marginTop: '4px',
    marginBottom: 0,
  },
  actionBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
};

export default PageHeader;
