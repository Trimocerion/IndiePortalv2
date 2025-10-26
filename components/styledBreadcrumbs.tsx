import * as React from 'react';
import { useRouter } from 'next/router';
import { styled } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import { Breadcrumbs } from '@mui/material';

const StyledBreadcrumb = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  fontWeight: theme.typography.fontWeightMedium,
  '&:hover, &:focus': {
    backgroundColor: theme.palette.primary.dark,
  },
  '&:active': {
    boxShadow: theme.shadows[1],
    backgroundColor: theme.palette.primary.dark,
  },
})) as typeof Chip;

/**
 * A component that displays styled breadcrumbs based on the current URL path.
 * @returns {React.ReactElement} The rendered styled breadcrumbs component.
 */
export default function StyledBreadcrumbs() {
  const router = useRouter();
  const { asPath } = router;

  const pathnames = asPath.split('/').filter((x) => x);

  return (
    <Breadcrumbs aria-label="breadcrumb" sx={{ mt: 2, ml: 3 }}>
      <StyledBreadcrumb
        component="a"
        href="/"
        label="Home"
        icon={<HomeIcon fontSize="small" />}
        onClick={(e) => {
          e.preventDefault();
          router.push('/');
        }}
      />
      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;

        return last ? (
          <StyledBreadcrumb key={to} component="span" label={value} />
        ) : (
          <StyledBreadcrumb
            key={to}
            component="a"
            href={to}
            label={value}
            onClick={(e) => {
              e.preventDefault();
              router.push(to);
            }}
          />
        );
      })}
    </Breadcrumbs>
  );
}
