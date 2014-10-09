(($) ->
	LCS.setRoute = (path) ->
		switch path
			when "/convos"
				LCS.wrapper.addClass "adminning"
) jQuery