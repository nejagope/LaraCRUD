@extends('layouts.%RoutePrefix%.main')

@section('title')
 - %RoutePrefix% %Table%
@endsection('title')

@section('head')
<script>
	function confirmation(msj){
		return confirm(msj);
	}
</script>
@endsection

@section('content')

<div class="container">
    <div class="row">        
        <div class="col-md-12">
            
			<h4> %Table% </h4>
			<hr>
			<table class="table table-striped table-responsive">
				<tr>
					%ColumnHeaders%
					<th> 
						<a href="{{ route('%RoutePrefix%_%Table%_create') }}"> 
							<span class="fa fa-plus-circle"></span> Agregar
						</a>
					</th>
				</tr>
				@foreach ($%Table% as $%TableSingular%)                                                                   
					<tr>
						%Fields%																                                        								
						<td>
							<table>
								<tr>
									<td>
										<a class="btn btn-warning btn-sm" href="{{ route('%RoutePrefix%_%Table%_edit', ['%TableSingular%' => $%TableSingular%]) }}"> 
											Edit
										</a>
									</td>

									<td>
										<form class="form form-inline" method="post" action="{{ route('%RoutePrefix%_%Table%_restore', ['%TableSingular%' => $%TableSingular%]) }}" onsubmit="return confirmation('Confirm restauration: ' + {{$%TableSingular%->id}});">								
											{{ csrf_field() }}										
											<input type="submit" class="btn btn-success btn-sm"  value="Restore">																				
										</form>  
									</td>

									<td>
										<form class="form form-inline" method="post" action="{{ route('%RoutePrefix%_%Table%_delete', ['%TableSingular%' => $%TableSingular%]) }}" onsubmit="return confirmation('Confirm deletion: ' + {{$%TableSingular%->id}});">								
											{{ csrf_field() }}										
											<input type="submit" class="btn btn-danger btn-sm"  value="Delete">																				
										</form>   
									</td>  
								</tr>
							</table>
						</td>
					</tr>                                    
				@endforeach                            
			</table>                                                 					                
        </div>
    </div>

</div>
@endsection