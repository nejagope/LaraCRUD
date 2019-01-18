@extends('layouts.main')

@section('head')
@endsection

@section('content')

<div class="container">
    <div class="row">        
        <div class="col-md-8 col-md-offset-2">
            <div class="panel panel-default">                                
            
                <div class="panel-heading">
					<h4> %Table% </h4>
					<hr>
                </div>

                <div class="panel-body">
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
								<td width="40%">
									<a class="btn btn-warning btn-sm" href="{{ route('%RoutePrefix%_%Table%_edit', ['%TableSingular%' => $%TableSingular%]) }}"> 
										Edit
									</a>

									<form class="form form-inline" method="post" action="{{ route('%RoutePrefix%_%Table%_delete', ['%TableSingular%' => $%TableSingular%]) }}" onsubmit="return confirmDelete();">								
										 {{ csrf_field() }}										
										<input type="submit" class="btn btn-danger btn-sm"  value="Delete">																				
									</form>                                        
								</td>
							</tr>                                    
						@endforeach                            
					</table>                                                 					
                </div>
				
            </div>
        </div>
    </div>

</div>
@endsection