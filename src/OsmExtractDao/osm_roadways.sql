 SELECT
      *
    FROM lines
    WHERE (
      (
        highway IN (
          'motorway',
          'trunk',
          'primary',
          'secondary',
          'tertiary',
          'unclassified',
          'residential',
          'living_street'
        )
      )
      OR
      (
        ( highway = 'service' )
        AND
        NOT(
          service IN (
            'parking',
            'driveway',
            'drive-through'
            )
          )
      )
    )
