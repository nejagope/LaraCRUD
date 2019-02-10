@extends('layouts.%RoutePrefix%.main')

@section('title')
 - %RoutePrefix% %Table%
@endsection('title')

@section('head')
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
							Add
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
										<div class="btn-group">
											<a class="btn btn-primary btn-sm" href="{{ route('%RoutePrefix%_%Table%_edit', ['%TableSingular%' => $%TableSingular%]) }}"> 
												Edit
											</a>
										
											@if (property_exists($%TableSingular%, 'deleted_at')) 
												@if (isset($%TableSingular%->deleted_at))																									
													<form class="form form-inline" method="post" action="{{ route('%RoutePrefix%_%Table%_restore', ['%TableSingular%' => $%TableSingular%]) }}" onsubmit="return confirmation('Confirm restauration: ' + {{$%TableSingular%->id}});">								
														{{ csrf_field() }}										
														<input type="submit" class="btn btn-success btn-sm"  value="Restore">																				
													</form>  	
												@else
													<form class="form form-inline" method="post" action="{{ route('%RoutePrefix%_%Table%_delete', ['%TableSingular%' => $%TableSingular%]) }}" onsubmit="return confirmation('Confirm deletion: ' + {{$%TableSingular%->id}});">								
														{{ csrf_field() }}										
														<input type="submit" class="btn btn-warning btn-sm"  value="Delete">																				
													</form>
												@endif																				
											@endif

											<form class="form form-inline" method="post" action="{{ route('%RoutePrefix%_%Table%_remove', ['%TableSingular%' => $%TableSingular%]) }}" onsubmit="return confirmation('Confirm permanent deletion: ' + {{$%TableSingular%->id}});">								
												{{ csrf_field() }}										
												<input type="submit" class="btn btn-danger btn-sm"  value="Remove">																				
											</form>
										</div>   
									</td>  
								</tr>
							</table>
						</td>
					</tr>                                    
				@endforeach                            
			</table>  
			<?php echo $%Table%->render(); ?>                                               					                
        </div>
    </div>

</div>
@endsection